/*
  # Fix RLS policies for matches table

  1. Security Updates
    - Drop existing restrictive policies
    - Add new policies allowing public access for all operations
    - Keep RLS enabled for security structure
    
  2. Changes
    - Allow public SELECT, INSERT, UPDATE, DELETE operations
    - Remove authentication requirements for admin operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON matches;
DROP POLICY IF EXISTS "Authenticated users can insert matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can update matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can delete matches" ON matches;

-- Create new policies allowing public access
CREATE POLICY "Public can view matches"
  ON matches
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert matches"
  ON matches
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update matches"
  ON matches
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete matches"
  ON matches
  FOR DELETE
  TO public
  USING (true);