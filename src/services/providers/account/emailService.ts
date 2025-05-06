
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends an invitation email to a provider with their temporary password
 */
export const sendProviderInviteEmail = async (
  userId: string,
  email: string,
  name: string,
  tempPassword: string,
  metadata: Record<string, any>
): Promise<{ success: boolean; emailError?: { message: string; code: string } }> => {
  try {
    // Get the Supabase Functions URL 
    const SUPABASE_URL = "https://ubztjjxmldogpwawcnrj.supabase.co";
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/send-provider-invite`;
    
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token || '';
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVienRqanhtbGRvZ3B3YXdjbnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODU4MjMsImV4cCI6MjA1OTg2MTgyM30.779CoUY0U1WO7RXXx9OWV1axrXS-UYXuleh_NvH0V8U";

    // Send direct email with temporary password
    const emailRequestBody = {
      userId: userId,
      email: email,
      name: name,
      tempPassword: tempPassword,
      metadata: metadata
    };

    console.log("Sending invite email with temporary password");
    
    const emailResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(emailRequestBody)
    });

    if (!emailResponse.ok) {
      console.error("Error sending invitation email:", await emailResponse.text());
      return {
        success: false,
        emailError: {
          message: `Erreur d'envoi d'email (${emailResponse.status})`,
          code: "EMAIL_FAILED"
        }
      };
    } else {
      const emailResult = await emailResponse.json();
      console.log("Email invitation result:", emailResult);
      return { success: true };
    }
    
  } catch (err: any) {
    console.error("Exception sending invitation email:", err);
    return {
      success: false,
      emailError: {
        message: err.message || "Erreur lors de l'envoi de l'email",
        code: "EMAIL_EXCEPTION"
      }
    };
  }
};
