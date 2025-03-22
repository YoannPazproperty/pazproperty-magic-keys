
import { toast } from "sonner";

// Interface for Technician
export interface Technician {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialty?: string;
  isActive: boolean;
  createdAt: string;
}

// Get technicians from localStorage
const getTechnicians = (): Technician[] => {
  const stored = localStorage.getItem('technicians');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing technicians from localStorage:', error);
    return [];
  }
};

// Save technicians to localStorage
const saveTechnicians = (technicians: Technician[]): void => {
  localStorage.setItem('technicians', JSON.stringify(technicians));
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const technicienService = {
  // Get all technicians
  getAll: (): Technician[] => {
    return getTechnicians();
  },

  // Get technician by ID
  getById: (id: string): Technician | undefined => {
    const technicians = getTechnicians();
    return technicians.find(tech => tech.id === id);
  },

  // Get technician by email
  getByEmail: (email: string): Technician | undefined => {
    const technicians = getTechnicians();
    return technicians.find(tech => tech.email === email);
  },

  // Verify technician credentials
  verifyCredentials: (email: string, password: string): Technician | null => {
    const technician = technicienService.getByEmail(email);
    if (technician && technician.password === password && technician.isActive) {
      return technician;
    }
    return null;
  },

  // Add a new technician
  add: (technician: Omit<Technician, 'id' | 'createdAt'>): Technician => {
    const technicians = getTechnicians();
    
    // Check if email already exists
    if (technicians.some(tech => tech.email === technician.email)) {
      throw new Error("Un technicien avec cet email existe déjà");
    }
    
    const newTechnician: Technician = {
      ...technician,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    technicians.push(newTechnician);
    saveTechnicians(technicians);
    
    return newTechnician;
  },

  // Update a technician
  update: (id: string, updates: Partial<Omit<Technician, 'id' | 'createdAt'>>): Technician | null => {
    const technicians = getTechnicians();
    const index = technicians.findIndex(tech => tech.id === id);
    
    if (index === -1) return null;
    
    // If updating email, check if it's already in use by another technician
    if (updates.email && updates.email !== technicians[index].email) {
      const emailExists = technicians.some(
        (tech, idx) => idx !== index && tech.email === updates.email
      );
      
      if (emailExists) {
        throw new Error("Un technicien avec cet email existe déjà");
      }
    }
    
    technicians[index] = {
      ...technicians[index],
      ...updates,
    };
    
    saveTechnicians(technicians);
    return technicians[index];
  },

  // Delete a technician
  delete: (id: string): boolean => {
    const technicians = getTechnicians();
    const filtered = technicians.filter(tech => tech.id !== id);
    
    if (filtered.length === technicians.length) {
      return false; // No technician was removed
    }
    
    saveTechnicians(filtered);
    return true;
  },

  // Activate/deactivate a technician
  toggleActive: (id: string): Technician | null => {
    const technicians = getTechnicians();
    const index = technicians.findIndex(tech => tech.id === id);
    
    if (index === -1) return null;
    
    technicians[index].isActive = !technicians[index].isActive;
    saveTechnicians(technicians);
    
    return technicians[index];
  }
};

export default technicienService;
