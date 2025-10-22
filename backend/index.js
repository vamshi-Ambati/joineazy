require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/db');

const authRoutes = require('./src/routes/auth');
const groupRoutes = require('./src/routes/groups');
const assignmentRoutes = require('./src/routes/assignments');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Welcome to JoinEazy API' }));

app.get('/db-check', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, created_at FROM users');
    res.json({ status: 'ok', users: result.rows, message: 'users fetched successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/assignments', assignmentRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  db.connect();
  console.log(`Server running on port ${PORT}`);
});
