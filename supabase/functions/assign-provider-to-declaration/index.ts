import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Ajuste le chemin si MCP.ts est dans un répertoire différent accessible par les fonctions.
// Si le MCP est dans /src et tes fonctions dans /supabase/functions,
// tu pourrais avoir besoin de configurer des chemins relatifs comme ci-dessous
// ou d'utiliser une stratégie d'import différente (ex: module partagé).
// Pour l'instant, on suppose un accès direct ou que tu as une copie/lien symbolique.
// IMPORTANT: Le code Deno des Edge Functions ne peut pas directement importer des modules TS Node sans transpilation ou un bundler.
// On va partir sur l'hypothèse que tu as un MCP accessible ou qu'on va le simuler ici pour l'instant.

// --- SIMULATION DE MCP (à remplacer par un vrai import si possible) ---
// Cette section simule l'objet MCP et ses méthodes. 
// Idéalement, tu importerais ton vrai MCP.ts.
const MCP_SIMULATED = {
  assignProviderAndNotifyWorkflow: async (declarationId: string, providerId: string) => {
    console.log(`SIMULATED MCP: Called assignProviderAndNotifyWorkflow for declaration ${declarationId} and provider ${providerId}`);
    // Simule une logique métier
    if (!declarationId || !providerId) {
      return {
        success: false,
        message: "Declaration ID and Provider ID are required.",
      };
    }
    // Simule une opération réussie
    return {
      success: true,
      message: "Provider assigned and notified successfully (SIMULATED).",
    };
  },
  logAction: async (actionName: string, metadata: any) => {
    console.log(`SIMULATED MCP: Logged action ${actionName} with metadata`, metadata);
  }
};
// --- FIN DE LA SIMULATION DE MCP ---

console.log("assign-provider-to-declaration function started");

serve(async (req) => {
  // Gérer la requête preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { declarationId, providerId } = await req.json();

    if (!declarationId || !providerId) {
      return new Response(JSON.stringify({ success: false, message: "Missing declarationId or providerId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Utilise le MCP_SIMULATED. Remplace par ton vrai MCP si l'import fonctionne.
    const result = await MCP_SIMULATED.assignProviderAndNotifyWorkflow(declarationId, providerId);

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: result.message || "Provider assigned and notified successfully." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: result.message || "Failed to assign provider." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500, // Ou un code d'erreur plus spécifique si disponible
      });
    }

  } catch (error) {
    console.error("Error in assign-provider-to-declaration function:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error", error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 