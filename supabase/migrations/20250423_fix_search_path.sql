
-- Mise à jour de la fonction fix_confirmation_tokens pour corriger le chemin de recherche
CREATE OR REPLACE FUNCTION public.fix_confirmation_tokens()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, auth, public
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

-- Mise à jour de la fonction handle_password_reset pour corriger le chemin de recherche
CREATE OR REPLACE FUNCTION public.handle_password_reset(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Logique personnalisée si nécessaire
  RETURN true;
END;
$$;

-- Mise à jour de la fonction handle_new_user pour corriger le chemin de recherche
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Mise à jour de la fonction has_role pour corriger le chemin de recherche
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  );
END;
$$;
