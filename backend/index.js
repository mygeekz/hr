const express = require('express');
const cors = require('cors');
const db = require('./db');
const jalaali = require('jalaali-js');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/notifications', (req, res) => {
  db.all('SELECT * FROM notifications ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => ({...row, createdAt: jalaali.toJalaali(new Date(row.createdAt))})));
  });
});

app.post('/notifications', (req, res) => {
  const { userId, title, body, type } = req.body;
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO notifications (userId, title, body, isRead, createdAt, type) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, title, body, 0, createdAt, type],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.listen(3001, () => {
  console.log('Backend server is running on http://localhost:3001');
});
