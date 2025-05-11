
import React from "react";

interface LoadingScreenProps {
  checkingRole: boolean;
  checkAttempts: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ checkingRole, checkAttempts }) => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-center text-gray-500">
          {checkingRole ? "Vérification des autorisations en cours..." : "Chargement..."}
        </p>
        {checkAttempts > 0 && (
          <p className="text-center text-gray-400 text-sm">
            Tentative {checkAttempts + 1}...
          </p>
        )}
        {checkAttempts > 1 && (
          <p className="text-center text-amber-500 text-sm mt-2">
            La vérification prend plus de temps que prévu. Merci de patienter...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
