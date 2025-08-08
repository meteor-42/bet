/*
  # Fix missing DELETE policy for players table

  1. Problem
    - RLS is enabled on players table
    - DELETE policy is missing, blocking player deletion
    - Only SELECT, INSERT, UPDATE policies exist

  2. Solution
    - Add public DELETE policy for players table
    - Allow admin operations through the app
*/

-- Add missing DELETE policy for players table
CREATE POLICY "Public can delete players"
  ON players
  FOR DELETE
  TO public
  USING (true);
