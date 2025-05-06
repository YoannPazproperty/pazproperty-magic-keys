
-- Ensure that the enum type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'provider', 'user');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Make sure we can add the new enum value if it's missing
DO $$
BEGIN
  -- Check if provider is already part of the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e 
    JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'user_role' AND e.enumlabel = 'provider'
  ) THEN
    -- Add the new enum value
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'provider';
  END IF;
EXCEPTION
  WHEN others THEN 
    RAISE NOTICE 'Error adding enum value: %', SQLERRM;
END$$;

-- Ensure that the roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user'::user_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the user_roles table if not already enabled
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to protect the user_roles table
DO $$
BEGIN
  -- Policy to allow users to view their own role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  -- Policy to allow administrators to manage all roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage all roles'
  ) THEN
    CREATE POLICY "Admins can manage all roles" ON public.user_roles
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
  
  -- Policy to allow the service role to access everything
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Service role has full access'
  ) THEN
    CREATE POLICY "Service role has full access" ON public.user_roles
      FOR ALL TO service_role USING (true);
  END IF;
END$$;

-- Make sure all existing users have a role
DO $$
DECLARE
  u RECORD;
BEGIN
  -- For each user without a role
  FOR u IN 
    SELECT au.id 
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    WHERE ur.user_id IS NULL
  LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (u.id, 'user');
  END LOOP;
END$$;

-- Update any existing prestadores_tecnicos roles to provider
DO $$
BEGIN
  -- Check if the enum value exists before attempting to update
  IF EXISTS (
    SELECT 1 FROM pg_enum e 
    JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'user_role' AND e.enumlabel = 'prestadores_tecnicos'
  ) THEN
    -- Update all records with prestadores_tecnicos to provider
    UPDATE public.user_roles 
    SET role = 'provider'::user_role 
    WHERE role::text = 'prestadores_tecnicos';
  END IF;
EXCEPTION
  WHEN others THEN 
    RAISE NOTICE 'Error updating roles: %', SQLERRM;
END$$;
