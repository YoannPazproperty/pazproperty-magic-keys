
-- Create a SQL function to fix NULL confirmation_token values in the auth.users table
CREATE OR REPLACE FUNCTION public.fix_confirmation_tokens()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  rows_updated INT;
BEGIN
  -- Update NULL confirmation_token values to empty string
  UPDATE auth.users 
  SET confirmation_token = '' 
  WHERE confirmation_token IS NULL;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  RETURN rows_updated || ' rows updated';
END;
$$;
