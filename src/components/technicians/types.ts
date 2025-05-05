
import { Technician } from '@/services/technicienService';

export interface TechnicianFormValues {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialty: string;
  isActive: boolean;
}

export interface TechnicianFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  technicianToEdit?: Technician | null;
}

export interface TechnicianListProps {
  technicians: Technician[];
  onEdit: (technician: Technician) => void;
  onDelete: (technician: Technician) => void;
  onToggleStatus: (id: string) => void;
  showPasswords: boolean;
}

export interface DeleteTechnicianDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  technicianName?: string;
  isDeleting: boolean;
  errorMessage: string | null;
}
