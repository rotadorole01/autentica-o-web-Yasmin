
const Database = require("better-sqlite3");
const path = require("path");

// Cria ou abre o banco de dados SQLite
const db = new Database(
  path.join(__dirname, "../database.db")
);

// Cria a tabela de usuários
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'cliente'
      CHECK(tipo IN ('cliente', 'admin'))
  )
`);

console.log("Banco de dados conectado com sucesso!");

module.exports = db;
