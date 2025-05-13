
// Re-export all functions from the refactored files for backward compatibility
export { checkUserExists } from "../userVerification";
export { checkUserHasRole, validateRoleForEmail, createUserRole } from "../roleManagement";
export { createAuthUser } from "../userCreation";
export { ensureUserWithRole } from "../userRoleService";
