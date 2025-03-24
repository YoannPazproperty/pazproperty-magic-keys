
import { Declaration } from "../types";
import { loadDeclarations, saveDeclarations } from "../storageService";

// Generate unique ID for new declarations
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Get all declarations with optional filters
export const getDeclarations = (statusFilter: string | null = null): Declaration[] => {
  let declarations = loadDeclarations();
  
  if (statusFilter) {
    declarations = declarations.filter(decl => decl.status === statusFilter);
  }
  
  // Sort by submission date, newest first
  return declarations.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
};

// Get a single declaration by ID
export const getDeclarationById = (id: string): Declaration | undefined => {
  const declarations = loadDeclarations();
  return declarations.find(decl => decl.id === id);
};

// Update an existing declaration
export const updateDeclaration = (id: string, updates: Partial<Declaration>): Declaration | null => {
  const declarations = loadDeclarations();
  const index = declarations.findIndex(decl => decl.id === id);
  
  if (index === -1) return null;
  
  // Update the declaration
  declarations[index] = {
    ...declarations[index],
    ...updates,
  };
  
  saveDeclarations(declarations);
  
  return declarations[index];
};

// Update declaration status 
export const updateDeclarationStatus = (id: string, status: Declaration["status"]): boolean => {
  const result = updateDeclaration(id, { status });
  return result !== null;
};
