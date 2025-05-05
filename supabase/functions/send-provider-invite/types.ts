
export interface ProviderInviteRequest {
  providerId: string;
}

export interface ProcessResult {
  success: boolean;
  error?: string;
  details?: any;
}
