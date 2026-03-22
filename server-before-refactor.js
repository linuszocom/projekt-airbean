import "dotenv/config";
import express from "express";
import Database from "better-sqlite3";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Middleware funktion som kräver korrekt API nyckel
function requireApiKey(req, res, next) {
  const apikey = req.headers["x-api-key"];

  // Om nyckel saknas eller inte matchar - svara 401 och inget next() anrop
  if (!apikey || apikey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Ogiltig eller saknad API-nyckel" });
  }
  // Nyckel stämmer - skickar vidare i flödet
  next();
}

app.use(express.json()); // middleware
// Registrerar vi middleware funktionen endast för /api-routes
app.use("/api", requireApiKey);

const db = new Database("./data/users.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  createdAt TEXT
)
  `);

app.get("/", (req, res) => {
  res.json({ meddelande: "Välkommen till Users API" });
});

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (!user) {
    return res.status(404).json({ fel: "Användaren hittades inte" });
  }

  res.json(user);
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body; // destructuring

  if (!name || !email) {
    return res.status(400).json({ fel: "Name och email krävs" });
  }

  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (name, email, createdAt)
    VALUES (?, ?, ?)
    `);

  const info = stmt.run(name, email, createdAt);

  const newUser = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: fel });
  }

  if (!req.body.name || !req.body.email) {
    return res.status(400).json({ fel: "Name och email krävs" });
  }

  const stmt = db.prepare(`
      UPDATE users
      SET name = ?, email = ?
      WHERE id = ?
    `);

  const result = stmt.run(req.body.name, req.body.email, id);

  if (result.changes === 0) {
    return res.status(404).json({ fel: "Användaren hittades inte" });
  }

  const updateUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  res.json(updateUser);
});

app.delete("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ fel: "Användaren hittades inte" });
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API:et lyssnar på http://localhost:${PORT}`);
});