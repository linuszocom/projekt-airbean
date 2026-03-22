import Database from "better-sqlite3";

const db = new Database("./data/airbean.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  createdAt TEXT
)
  `);

export default db;
