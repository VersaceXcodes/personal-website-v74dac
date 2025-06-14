import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const { Pool } = pkg;
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET, PORT = 3000 } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}

// Configure the PostgreSQL client
const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { rejectUnauthorized: false } // Updated to allow connection to database
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { rejectUnauthorized: false },
      }
);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Middleware to authenticate with JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

/**
 * User login
 */
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length == 0) return res.status(401).json({ error: 'User not found' });
    
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user_id: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * Retrieve available templates
 */
app.get('/api/templates', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM templates');
    res.json({ templates: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * Create a new site
 */
app.post('/api/sites', authenticateToken, async (req, res) => {
  const { template_id, domain_name, color_scheme, fonts } = req.body;
  const user_id = req.user.user_id;
  const site_id = `site_${Date.now()}`;

  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO sites (site_id, user_id, template_id, domain_name, color_scheme, fonts, date_created) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [site_id, user_id, template_id, domain_name, color_scheme, fonts, new Date().toISOString()]
    );
    res.status(201).json({ site_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * Update page content
 */
app.put('/api/sites/:site_id/pages/:page_id', authenticateToken, async (req, res) => {
  const { site_id, page_id } = req.params;
  const { content, seo_meta } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE pages SET content = $1, seo_meta = $2 WHERE page_id = $3 AND site_id = $4',
      [content, seo_meta, page_id, site_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, message: 'Page successfully updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * Submit a comment on a blog post
 */
app.post('/api/posts/:post_id/comments', async (req, res) => {
  const { post_id } = req.params;
  const { author_name, author_email, content } = req.body;
  const comment_id = `comment_${Date.now()}`;

  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO comments (comment_id, post_id, author_name, author_email, content, publish_date) VALUES ($1, $2, $3, $4, $5, $6)',
      [comment_id, post_id, author_name, author_email, content, new Date().toISOString()]
    );
    res.status(201).json({ comment_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * Submit a contact form
 */
app.post('/api/sites/:site_id/contact', async (req, res) => {
  const { site_id } = req.params;
  const { name, email, message } = req.body;
  const submission_id = `submission_${Date.now()}`;

  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO contact_submissions (submission_id, site_id, name, email, message, submission_date) VALUES ($1, $2, $3, $4, $5, $6)',
      [submission_id, site_id, name, email, message, new Date().toISOString()]
    );
    res.status(201).json({ submission_id, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

import path from 'path';
import { fileURLToPath } from 'url';

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../vitereact/dist')));

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../vitereact/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});