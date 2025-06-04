import { useToast as useShadeToast, toast } from "../../components/ui/use-toast";

// Wrap the hook to maintain backward compatibility
export const useToast = useShadeToast;

// Re-export toast directly
export { toast };
