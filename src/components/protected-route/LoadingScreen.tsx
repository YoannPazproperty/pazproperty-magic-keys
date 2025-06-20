import React from "react";

interface LoadingScreenProps {
  checkingRole?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ checkingRole }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>
        {checkingRole ? "Vérification du rôle de l'utilisateur..." : "Chargement..."}
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f9f9f9",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "6px solid #f3f3f3",
    borderTop: "6px solid #00A4FF", // Couleur de ta marque
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  message: {
    fontSize: "18px",
    color: "#555",
  },
};

// Ajout des animations globales si non déjà présentes
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default LoadingScreen;