const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');


router.post('/create-group', verifyToken, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name required' });

    const q = `INSERT INTO groups_table (name, created_by) VALUES ($1, $2) RETURNING *`;
    const { rows } = await db.query(q, [name, req.users.id]);
    res.status(201).json({ group: rows[0], message: "Group created successfully" });
  } catch (err) {
    next(err);
  }
});


router.post('/add-member', verifyToken, async (req, res, next) => {
  try {
    const { group_id, member_email, member_id } = req.body;
    if (!group_id || (!member_email && !member_id)) return res.status(400).json({ error: 'group_id and member_email/member_id required' });

    let studentId = member_id;
    if (!studentId) {
      const qusers = `SELECT id FROM users WHERE email=$1`;
      const u = await db.query(qusers, [member_email.toLowerCase()]);
      if (!u.rows.length) return res.status(404).json({ error: 'users not found' });
      studentId = u.rows[0].id;
    }

    // Prevent duplicates
    const exists = await db.query(`SELECT 1 FROM group_members WHERE group_id=$1 AND users_id=$2`, [group_id, studentId]);
    if (exists.rows.length) return res.status(400).json({ error: 'Member already in group' });

    await db.query(`INSERT INTO group_members (group_id, users_id, created_by) VALUES ($1,$2,$3)`, [group_id, studentId, req.users.id]);
    res.json({ success: true, group_id, users_id: studentId });
  } catch (err) {
    next(err);
  }
});


router.get('/get-groups-by-user', verifyToken, async (req, res, next) => {
  try {
    const q = `
      SELECT g.*,
        (
          SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'email', s.email))
          FROM group_members gm 
          JOIN users s ON s.id = gm.users_id
          WHERE gm.group_id = g.id
        ) AS members
      FROM groups_table g
      WHERE g.created_by = $1 
         OR g.id IN (SELECT group_id FROM group_members WHERE users_id = $1)
      ORDER BY g.created_at DESC
    `;
    const { rows } = await db.query(q, [req.users.id]);
    res.json({ groups: rows, message: 'Groups fetched successfully' });
  } catch (err) {
    next(err);
  }
});


/**
 * Group progress: returns assignments for a group and submission flags
 */
// router.get('/:groupId/progress', verifyToken, async (req, res, next) => {
//   try {
//     const groupId = req.params.groupId;
//     const q = `
//       SELECT a.id as assignment_id, a.title, a.due_date, a.onedrive_link,
//              ga.submitted, ga.confirmed, ga.submission_at, ga.confirmed_at
//       FROM assignments a
//       LEFT JOIN group_assignments ga ON ga.assignment_id = a.id AND ga.group_id = $1
//       ORDER BY a.due_date
//     `;
//     const { rows } = await db.query(q, [groupId]);
//     res.json({ progress: rows });
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = router;
