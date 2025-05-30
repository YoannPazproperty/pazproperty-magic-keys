import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig({
  plugins: [
    react(),
    // On ajoute componentTagger seulement si on est en mode dev
    process.env.NODE_ENV === "development" ? componentTagger() : null
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Désactiver l’optimisation de cette dépendance
    exclude: ["lovable-tagger"]
  },
  server: {
    port: 8080,
    host: "0.0.0.0",
  },
});