
import { corsHeaders } from "./cors.ts";
import { ContactFormData } from "./types.ts";

export function handleOptionsRequest(): Response {
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders 
  });
}

export async function parseRequestBody(req: Request): Promise<ContactFormData> {
  const rawBody = await req.text();
  console.log("📄 Raw request body:", rawBody);
  
  if (!rawBody || rawBody.trim() === "") {
    throw new Error("Request body is empty");
  }
  
  const formData = JSON.parse(rawBody);
  console.log("📝 Parsed form data:", formData);
  return formData;
}
