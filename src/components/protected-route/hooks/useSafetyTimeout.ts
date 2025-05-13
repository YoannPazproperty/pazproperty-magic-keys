
import { useCallback, useRef } from "react";

export const useSafetyTimeout = () => {
  const timeoutRef = useRef<number | null>(null);
  
  // Start a safety timeout
  const startSafetyTimeout = useCallback((callback: () => void, ms: number): number => {
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout
    const id = window.setTimeout(() => {
      timeoutRef.current = null;
      callback();
    }, ms);
    
    timeoutRef.current = id;
    return id;
  }, []);
  
  // Clear the safety timeout
  const clearSafetyTimeout = useCallback((id?: number): void => {
    const timeoutId = id !== undefined ? id : timeoutRef.current;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutRef.current = null;
    }
  }, []);
  
  return { startSafetyTimeout, clearSafetyTimeout };
};
