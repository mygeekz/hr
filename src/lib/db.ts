import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'development' ? 'dev.db' : 'prod.db';
const db = new Database(dbPath, { verbose: console.log });

// Create notifications table if it doesn't exist
db.exec(`
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

export default db;
