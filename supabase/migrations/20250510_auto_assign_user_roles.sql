
-- Fonction pour attribuer automatiquement des rôles en fonction des métadonnées
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
DECLARE
  user_role text;
  user_id uuid;
BEGIN
  -- Récupérer l'identifiant de l'utilisateur
  user_id := NEW.id;

  -- Vérifier si un rôle est défini dans les métadonnées utilisateur
  IF (NEW.raw_user_meta_data ->> 'role') IS NOT NULL THEN
    user_role := NEW.raw_user_meta_data ->> 'role';
  ELSE
    -- Rôle par défaut si non spécifié
    user_role := 'customer';
  END IF;

  -- Ajouter le rôle dans user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, user_role::user_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Actions spécifiques selon le rôle
  IF user_role = 'provider' THEN
    -- Aussi ajouter à prestadores_roles pour la compatibilité
    INSERT INTO public.prestadores_roles (user_id, nivel)
    VALUES (user_id, 'standard')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Ajouter une entrée de log pour le suivi
  BEGIN
    INSERT INTO public.logs (message, data)
    VALUES (
      'Nouvel utilisateur avec rôle assigné automatiquement',
      jsonb_build_object(
        'user_id', user_id,
        'role', user_role,
        'email', NEW.email,
        'created_at', NOW()
      )
    );
    EXCEPTION WHEN undefined_table THEN
      -- Ignorer l'erreur si la table logs n'existe pas
      NULL;
  END;

  RETURN NEW;
END;
$$;

-- Vérifier si le déclencheur existe déjà avant de le créer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    -- Créer le déclencheur pour exécuter la fonction lors de la création d'un nouvel utilisateur
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END
$$;

-- Ajouter une contrainte unique pour éviter les doublons
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);

-- S'assurer que la table user_roles a bien la colonne created_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.user_roles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END
$$;
