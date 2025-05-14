import React from 'react';
import './LoadingScreen.css'; // Ce chemin est correct puisque les deux fichiers sont dans le même dossier

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Chargement en cours...</p>
    </div>
  );
};

export default LoadingScreen;