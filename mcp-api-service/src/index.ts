import express from "express";
import declarationRoutes from './routes/declarationRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json()); // Middleware pour parser le JSON des requêtes

// Route de test simple
app.get("/ping", (req, res) => {
  res.status(200).send("pong MCP API");
});

// --- Ici viendront tes routes pour le MCP ---
app.use('/api/declarations', declarationRoutes);
// -------------------------------------------

app.listen(port, () => {
  console.log(`MCP API Service listening at http://localhost:${port}`);
}); 