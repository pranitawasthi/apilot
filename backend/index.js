  import express from 'express';
  import cors from 'cors';
  import Database from 'better-sqlite3';
  import bcrypt from 'bcryptjs';
  import jwt from 'jsonwebtoken';
  import dotenv from 'dotenv';

  dotenv.config();

  const app = express();
  const db = new Database('postman.db');

  app.use(cors());
  app.use(express.json());

  // Initialize database
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      method TEXT NOT NULL,
      headers TEXT,
      body TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Middleware to verify JWT
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  };

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
      const result = stmt.run(email, hashedPassword);
      
      const token = jwt.sign({ id: result.lastInsertRowid, email }, process.env.JWT_SECRET);
      
      res.json({ 
        token, 
        user: { id: result.lastInsertRowid, email } 
      });
    } catch (err) {
      if (err.message.includes('UNIQUE constraint')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
      console.log(token);
      
      res.json({ 
        token, 
        user: { id: user.id, email: user.email } 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Request routes
  app.get('/api/requests', authenticateToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC');
      const requests = stmt.all(req.user.id);
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/requests', authenticateToken, (req, res) => {
    try {
      const { name, description, url, method, headers, body } = req.body;
      
      const stmt = db.prepare(`
        INSERT INTO requests (user_id, name, description, url, method, headers, body)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(req.user.id, name, description, url, method, headers, body);
      
      res.json({ id: result.lastInsertRowid, message: 'Request saved' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/requests/:id', authenticateToken, (req, res) => {
    try {
      const stmt = db.prepare('DELETE FROM requests WHERE id = ? AND user_id = ?');
      stmt.run(req.params.id, req.user.id);
      res.json({ message: 'Request deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });


