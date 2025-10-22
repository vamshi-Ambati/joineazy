const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const q = `INSERT INTO students (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role`;
    const vals = [name, email.toLowerCase(), hashed, role || 'student'];
    const { rows } = await db.query(q, vals);
    res.status(201).json({ user: rows[0], message: 'Registration successful' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Email already exists' });
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password and role required' });

    const q = `SELECT id, name, email, password, role FROM students WHERE email=$1`;
    const { rows } = await db.query(q, [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } , message: 'Login successful' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
