/*
  # Create user_vaults table for encrypted user data storage

  ## Summary
  This migration creates the core persistence layer for Project Hub. All user data
  (projects and tasks) is stored as a single AES-256-GCM encrypted, gzip-compressed
  JSON blob per user. The server never sees plaintext content — encryption and
  decryption happen entirely in the browser.

  ## New Tables

  ### user_vaults
  One row per authenticated user. Stores the complete encrypted state of that user's
  workspace.

  | Column          | Type        | Description |
  |-----------------|-------------|-------------|
  | id              | uuid PK     | Row identifier |
  | user_id         | uuid FK     | Owning Supabase auth user (unique — one vault per user) |
  | encrypted_blob  | text        | Base64-encoded AES-256-GCM ciphertext of gzipped JSON |
  | iv              | text        | Base64-encoded 12-byte AES-GCM initialisation vector |
  | salt            | text        | Base64-encoded HKDF salt used for key derivation |
  | version         | integer     | Schema version for future data-format migrations (default 1) |
  | updated_at      | timestamptz | Last write timestamp; used for last-write-wins conflict resolution |

  ## Security

  - RLS enabled on user_vaults.
  - Four separate policies (SELECT / INSERT / UPDATE / DELETE) scoped to `authenticated`.
  - Every policy checks `auth.uid() = user_id`, so a user can only access their own vault.
  - upsert on conflict `user_id` is the intended write pattern (one vault per user).

  ## Notes

  1. The unique constraint on user_id enforces the one-vault-per-user invariant at the
     database level.
  2. Policies are dropped before creation to make this migration idempotent.
  3. No plaintext project or task columns exist — search and filtering are intentionally
     client-side to preserve end-to-end encryption.
*/

CREATE TABLE IF NOT EXISTS user_vaults (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_blob text      NOT NULL,
  iv           text        NOT NULL,
  salt         text        NOT NULL,
  version      integer     NOT NULL DEFAULT 1,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_vaults ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own vault"   ON user_vaults;
DROP POLICY IF EXISTS "Users can create own vault" ON user_vaults;
DROP POLICY IF EXISTS "Users can update own vault" ON user_vaults;
DROP POLICY IF EXISTS "Users can delete own vault" ON user_vaults;

CREATE POLICY "Users can read own vault"
  ON user_vaults FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vault"
  ON user_vaults FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault"
  ON user_vaults FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault"
  ON user_vaults FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
