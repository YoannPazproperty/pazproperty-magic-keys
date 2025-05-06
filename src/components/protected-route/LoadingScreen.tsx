
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
          {checkingRole ? "Checking permissions..." : "Loading..."}
        </p>
        {checkAttempts > 0 && (
          <p className="text-center text-gray-400 text-sm">
            Attempt {checkAttempts + 1}...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
