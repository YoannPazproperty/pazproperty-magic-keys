
-- Cette migration assure que les utilisateurs spécifiques ont le rôle admin

-- Crée le rôle admin pour alexa@pazproperty.pt
DO $$
BEGIN
  -- Vérifier si l'utilisateur existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'alexa@pazproperty.pt') THEN
    -- Supprimer les rôles existants pour cet utilisateur
    DELETE FROM public.user_roles 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'alexa@pazproperty.pt');
    
    -- Ajouter le rôle admin
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (
      (SELECT id FROM auth.users WHERE email = 'alexa@pazproperty.pt'),
      'admin'
    );
  END IF;
  
  -- Vérifier si l'utilisateur existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'yoann@pazproperty.pt') THEN
    -- Supprimer les rôles existants pour cet utilisateur
    DELETE FROM public.user_roles 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'yoann@pazproperty.pt');
    
    -- Ajouter le rôle admin
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (
      (SELECT id FROM auth.users WHERE email = 'yoann@pazproperty.pt'),
      'admin'
    );
  END IF;
  
  -- Ajouter une entrée dans les logs pour le suivi
  INSERT INTO public.logs (message, data)
  VALUES (
    'Attribution des rôles admin effectuée',
    jsonb_build_object(
      'timestamp', now(),
      'executed_by', current_user
    )
  );
END
$$;
