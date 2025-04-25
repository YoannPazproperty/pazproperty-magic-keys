
-- Fonction pour vérifier un token de réinitialisation de mot de passe et renvoyer les données utilisateur
CREATE OR REPLACE FUNCTION public.verify_password_reset_token(token_param TEXT)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  token_record RECORD;
  user_record RECORD;
BEGIN
  -- Vérifier si la table password_reset_tokens existe
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'password_reset_tokens'
  ) THEN
    RAISE EXCEPTION 'La table de tokens de réinitialisation n''existe pas';
  END IF;

  -- Rechercher le token
  SELECT * FROM public.password_reset_tokens 
  WHERE token = token_param AND expires_at > now()
  INTO token_record;
  
  -- Si aucun token trouvé ou expiré, renvoyer NULL
  IF token_record IS NULL THEN
    -- Ajouter du journalisation pour le débogage
    BEGIN
      INSERT INTO public.logs (message, data)
      VALUES (
        'Token de réinitialisation invalide ou expiré', 
        jsonb_build_object(
          'token', substring(token_param, 1, 8) || '...',
          'timestamp', now()
        )
      );
      EXCEPTION WHEN undefined_table THEN
        -- Si la table logs n'existe pas, continuer sans erreur
        NULL;
    END;
    
    RETURN;
  END IF;
  
  -- Rechercher les informations de l'utilisateur associé au token
  SELECT id, email FROM auth.users 
  WHERE id = token_record.user_id
  INTO user_record;
  
  -- Si l'utilisateur existe, renvoyer ses informations
  IF user_record IS NULL THEN
    -- Ajouter du journalisation pour le débogage
    BEGIN
      INSERT INTO public.logs (message, data)
      VALUES (
        'Utilisateur non trouvé pour token valide', 
        jsonb_build_object(
          'token', substring(token_param, 1, 8) || '...',
          'user_id', token_record.user_id
        )
      );
      EXCEPTION WHEN undefined_table THEN
        -- Si la table logs n'existe pas, continuer sans erreur
        NULL;
    END;
    
    RETURN;
  END IF;
  
  -- Retourner l'ID et l'email de l'utilisateur
  user_id := user_record.id;
  user_email := user_record.email;
  RETURN NEXT;
  
  -- Ajouter du journalisation pour le débogage
  BEGIN
    INSERT INTO public.logs (message, data)
    VALUES (
      'Token de réinitialisation vérifié avec succès', 
      jsonb_build_object(
        'token', substring(token_param, 1, 8) || '...',
        'user_id', user_record.id,
        'user_email', user_record.email
      )
    );
    EXCEPTION WHEN undefined_table THEN
      -- Si la table logs n'existe pas, continuer sans erreur
      NULL;
  END;
  
  EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, journaliser et renvoyer NULL
    BEGIN
      INSERT INTO public.logs (message, data)
      VALUES (
        'Erreur lors de la vérification du token', 
        jsonb_build_object(
          'token', substring(token_param, 1, 8) || '...',
          'error', SQLERRM
        )
      );
      EXCEPTION WHEN undefined_table THEN
        -- Si la table logs n'existe pas, continuer sans erreur
        NULL;
    END;
    
    RETURN;
END;
$$;

-- Créer la table de logs si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fonction pour stocker un token de réinitialisation
CREATE OR REPLACE FUNCTION public.store_password_reset_token(
  user_id_param UUID,
  token_param TEXT,
  expires_at_param TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Créer la table si elle n'existe pas
  EXECUTE run_sql(
    'CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )'
  );
  
  -- Supprimer les anciens tokens pour cet utilisateur
  DELETE FROM public.password_reset_tokens WHERE user_id = user_id_param;
  
  -- Insérer le nouveau token
  INSERT INTO public.password_reset_tokens (user_id, token, expires_at)
  VALUES (user_id_param, token_param, expires_at_param);
  
  RETURN TRUE;
  
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Activer les politiques de sécurité sur ces tables
ALTER TABLE IF EXISTS public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;

-- Appliquer les politiques de sécurité
DROP POLICY IF EXISTS "Enable all access for service role" ON public.password_reset_tokens;
CREATE POLICY "Enable all access for service role" ON public.password_reset_tokens TO service_role USING (true);

DROP POLICY IF EXISTS "Enable all access for service role" ON public.logs;
CREATE POLICY "Enable all access for service role" ON public.logs TO service_role USING (true);
