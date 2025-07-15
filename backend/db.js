const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      isRead BOOLEAN NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);
});

module.exports = db;
