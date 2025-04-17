
import { corsHeaders } from "./cors.ts";
import { parseRequestBody } from "./requests.ts";
import { ContactFormData, ProcessResult } from "./types.ts";

export async function logRequest(req: Request): Promise<ContactFormData> {
  // Log headers
  console.log("📋 Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Log Content-Type specifically
  console.log("📋 Content-Type:", req.headers.get("Content-Type"));
  
  // Parse the request body
  return await parseRequestBody(req);
}

export function logProcessResults(emailResult: ProcessResult, dbResult: ProcessResult): void {
  // Log detailed results of both processes
  if (emailResult.success) {
    console.log("✅ Email process succeeded with details:", emailResult.details);
  } else {
    console.error("❌ Email process failed:", emailResult.error, emailResult.details);
  }

  if (dbResult.success) {
    console.log("✅ Database process succeeded with details:", dbResult.details);
  } else {
    console.error("❌ Database process failed:", dbResult.error, dbResult.details);
  }
}
