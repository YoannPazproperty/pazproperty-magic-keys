
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import { ContactFormData, ProcessResult } from "./types.ts";

// Database function
export async function saveToDatabase(formData: ContactFormData): Promise<ProcessResult> {
  console.log("💾 Starting database save process...");
  
  try {
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Supabase credentials missing");
      return {
        success: false,
        error: "Database configuration error: Supabase credentials missing"
      };
    }
    
    console.log("✅ Supabase credentials found");
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Prepare data for insertion
    const contactData = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      tipo: formData.tipo,
      mensagem: formData.mensagem,
    };
    
    console.log("📝 Saving contact to database:", contactData);
    
    // Insert into database
    const { data, error } = await supabase
      .from("contactos_comerciais")
      .insert(contactData)
      .select();
    
    if (error) {
      console.error("❌ Database insertion error:", error);
      return {
        success: false,
        error: "Failed to save contact to database",
        details: error
      };
    }
    
    console.log("✅ Contact saved to database:", data);
    return {
      success: true,
      details: data
    };
  } catch (dbError: any) {
    console.error("❌ Database error:", dbError);
    return {
      success: false,
      error: "Database error",
      details: dbError.message
    };
  }
}
