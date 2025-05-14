import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Chargement en cours...</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f9f9f9',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '6px solid #f3f3f3',
    borderTop: '6px solid #00A4FF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  text: {
    fontSize: '18px',
    color: '#555',
  },
};

// Inject simple keyframes for spinner animation
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
if (styleSheet) {
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}

export default LoadingScreen;