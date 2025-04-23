
-- Fonction pour vérifier si une table existe
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Fonction pour créer la table de tokens de réinitialisation si elle n'existe pas
CREATE OR REPLACE FUNCTION public.create_password_reset_tokens_table()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
  
  -- Politique permettant à tous les utilisateurs de service role d'accéder à la table
  DROP POLICY IF EXISTS "Enable all access for service role" ON public.password_reset_tokens;
  CREATE POLICY "Enable all access for service role" ON public.password_reset_tokens TO service_role USING (true);
  
  -- Politique permettant aux utilisateurs authentifiés d'accéder uniquement à leurs propres tokens
  DROP POLICY IF EXISTS "Users can view own tokens" ON public.password_reset_tokens;
  CREATE POLICY "Users can view own tokens" ON public.password_reset_tokens 
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
END;
$$;

-- Fonction pour exécuter du SQL arbitraire (réservé au service role)
CREATE OR REPLACE FUNCTION public.run_sql(sql text)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
