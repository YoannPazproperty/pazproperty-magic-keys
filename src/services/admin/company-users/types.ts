
export type CompanyUserLevel = 'admin' | 'user';

export interface CompanyUserParams {
  email: string;
  name: string;
  level: CompanyUserLevel;
}

export interface CreateCompanyUserParams extends CompanyUserParams {
  password: string;
}

export interface UpdateCompanyUserParams extends CompanyUserParams {
  userId: string;
}

export interface CompanyUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  level: CompanyUserLevel;
  created_at: string;
}

export interface CompanyUserResult {
  success: boolean;
  message?: string;
  userId?: string;
  error?: any;
  emailSent?: boolean;
}

export interface GetCompanyUsersResult {
  success: boolean;
  users?: CompanyUser[];
  error?: any;
  message?: string;
}
