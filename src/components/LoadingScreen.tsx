
import React from "react";

interface LoadingScreenProps {
  checkingRole?: boolean;
}

const LoadingScreen = ({ checkingRole }: LoadingScreenProps) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {checkingRole ? "Vérification des rôles en cours..." : "Chargement..."}
    </div>
  );
};

export default LoadingScreen;
