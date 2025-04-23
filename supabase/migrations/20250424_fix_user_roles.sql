
-- Assurer que la table des rôles existe
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user'::user_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- S'assurer que le type enum existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Activer RLS sur la table user_roles si elle ne l'est pas déjà
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS pour protéger la table user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage user roles'
  ) THEN
    CREATE POLICY "Admins can manage user roles" ON public.user_roles
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Service role has full access'
  ) THEN
    CREATE POLICY "Service role has full access" ON public.user_roles
      FOR ALL TO service_role USING (true);
  END IF;
END$$;

-- Assurer que la table des logs existe pour le débogage
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur la table logs si elle ne l'est pas déjà
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;

-- Politique pour les logs
DROP POLICY IF EXISTS "Service role can manage logs" ON public.logs;
CREATE POLICY "Service role can manage logs" ON public.logs
  FOR ALL TO service_role USING (true);
