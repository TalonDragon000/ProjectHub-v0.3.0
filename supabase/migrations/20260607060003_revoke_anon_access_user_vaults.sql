-- Explicitly revoke all privileges from the anon role on user_vaults.
-- All four RLS policies are already scoped to `authenticated` only,
-- but this ensures anonymous sign-in tokens can never touch this table
-- even if a misconfigured policy is added in the future.
REVOKE ALL ON TABLE user_vaults FROM anon;

-- Also revoke from public to be explicit (Supabase grants usage to public by default).
REVOKE ALL ON TABLE user_vaults FROM PUBLIC;

-- Re-grant the minimum needed for authenticated users only.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_vaults TO authenticated;
