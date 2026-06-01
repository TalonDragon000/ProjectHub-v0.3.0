/*
  # Create user_vaults table for encrypted user data storage

  1. New Tables
    - `user_vaults`
      - `id` (uuid, primary key) - unique row identifier
      - `user_id` (uuid, references auth.users) - the owning user, unique constraint
      - `encrypted_blob` (text) - AES-256-GCM encrypted and gzipped JSON payload, base64-encoded
      - `iv` (text) - 12-byte initialization vector for AES-GCM, base64-encoded
      - `salt` (text) - HKDF salt used for key derivation, base64-encoded
      - `version` (integer) - schema version for future data migrations
      - `updated_at` (timestamptz) - last sync timestamp, used for last-write-wins resolution

  2. Security
    - Enable RLS on `user_vaults` table
    - SELECT policy: users can only read their own vault
    - INSERT policy: users can only create their own vault
    - UPDATE policy: users can only update their own vault
    - DELETE policy: users can only delete their own vault

  3. Notes
    - Each user has exactly one vault row (unique constraint on user_id)
    - The encrypted_blob contains all user data (projects + tasks) as a single encrypted payload
    - The dev/server never sees plaintext user content
*/

CREATE TABLE IF NOT EXISTS user_vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  encrypted_blob text NOT NULL,
  iv text NOT NULL,
  salt text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own vault"
  ON user_vaults
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vault"
  ON user_vaults
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault"
  ON user_vaults
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault"
  ON user_vaults
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);