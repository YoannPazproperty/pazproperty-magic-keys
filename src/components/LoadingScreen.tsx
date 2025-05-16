
import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Chargement en cours...</p>
    </div>
  );
};

export default LoadingScreen;
