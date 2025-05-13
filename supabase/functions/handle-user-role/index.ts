
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

// Handle CORS
Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    const { userId, role } = requestData;
    
    if (!userId || !role) {
      return new Response(
        JSON.stringify({ error: 'User ID et rôle sont requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupérer les infos de l'utilisateur pour vérification
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
      return new Response(
        JSON.stringify({ error: 'Utilisateur non trouvé', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Vérifier d'abord si l'utilisateur a déjà ce rôle
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
      
    if (roleError) {
      console.error('Erreur lors de la vérification du rôle existant:', roleError);
    }
    
    // Si le rôle existe déjà, ne rien faire de plus
    if (existingRole) {
      return new Response(
        JSON.stringify({ 
          message: `L'utilisateur a déjà le rôle ${role}`,
          user: userData.user,
          role: existingRole
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Ajouter le rôle à l'utilisateur
    const { data: newRole, error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();
      
    if (insertError) {
      console.error('Erreur lors de l\'ajout du rôle:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'ajout du rôle', details: insertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Actions spécifiques en fonction du rôle
    if (role === 'provider') {
      // Si c'est un prestataire, ajouter à prestadores_roles aussi
      try {
        const { error: prestadorError } = await supabase
          .from('prestadores_roles')
          .insert({
            user_id: userId,
            nivel: 'standard'
          });
          
        if (prestadorError && prestadorError.code !== '23505') { // Ignorer les erreurs de contrainte unique
          console.error('Erreur lors de l\'ajout du rôle prestataire:', prestadorError);
        }
      } catch (err) {
        console.error('Exception lors de l\'ajout du rôle prestataire:', err);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: `Rôle ${role} ajouté avec succès à l'utilisateur`, 
        user: userData.user,
        role: newRole
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
