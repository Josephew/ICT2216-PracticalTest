const express = require('express');
const { Pool } = require('pg');
const { validateSearchTerm } = require('./validate');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Table name = student ID, as required by Q4(i). Postgres requires quoted
// identifiers for names that start with a digit; this constant is fixed by
// us (never derived from user input), so building the SQL string with it is
// safe -- the injection risk that matters is the *value* being inserted,
// which is always sent as a parameterized bind variable ($1) below.
const TABLE_NAME = '"2402195"';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/search', async (req, res) => {
  const { valid, reason, term } = validateSearchTerm(req.body && req.body.query);

  if (!valid) {
    // Part (g): reject attack/invalid input, do not process or store it.
    return res.status(400).json({ error: reason });
  }

  try {
    // Parameterized query: defense-in-depth against SQL injection even
    // though the allow-list should already exclude injection payloads.
    await pool.query(
      `INSERT INTO ${TABLE_NAME} (search_query, search_time) VALUES ($1, NOW())`,
      [term]
    );
    return res.json({ query: term });
  } catch (err) {
    console.error('DB insert failed:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
