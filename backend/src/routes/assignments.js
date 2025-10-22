const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');


router.post('/create-assignment', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, description, due_date, onedrive_link } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    const q = `INSERT INTO assignments (title, description, due_date, onedrive_link, assigned_by)
               VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const vals = [title, description || null, due_date || null, onedrive_link || null, req.users.id];
    const { rows } = await db.query(q, vals);
    res.status(201).json({ assignment: rows[0] });
  } catch (err) {
    next(err);
  }
});


router.put('/edit-assignment/:id', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, description, due_date, onedrive_link } = req.body;
    const q = `UPDATE assignments SET title=$1, description=$2, due_date=$3, onedrive_link=$4 WHERE id=$5 RETURNING *`;
    const vals = [title, description, due_date, onedrive_link, id];
    const { rows } = await db.query(q, vals);
    res.json({ assignment: rows[0] });
  } catch (err) {
    next(err);
  }
});


router.get('/get-assignments-for-student', verifyToken, async (req, res, next) => {
  try {
    const studentId = req.users.id;

    const q = `
      SELECT 
        a.id AS assignment_id,
        a.title,
        a.description,
        a.due_date,
        a.onedrive_link,
        g.id AS group_id,
        g.name AS group_name,
        ga.submitted,
        ga.confirmed,
        ga.submission_at,
        ga.confirmed_at
      FROM assignments a
      JOIN group_assignments ga ON ga.assignment_id = a.id
      JOIN groups_table g ON g.id = ga.group_id
      JOIN group_members gm ON gm.group_id = g.id
      WHERE gm.users_id = $1
      ORDER BY a.due_date NULLS LAST, a.created_at DESC
    `;

    const { rows } = await db.query(q, [studentId]);
    res.json({ assignments: rows });
  } catch (err) {
    next(err);
  }
});


router.post('/assign-assignment/:assignmentId', verifyToken, async (req, res) => {
  const { group_ids } = req.body; 
  const assignment_id = req.params.assignmentId;

  try {
    for (const group_id of group_ids) {
      await db.query(
        `INSERT INTO group_assignments (group_id, assignment_id) VALUES ($1, $2)`,
        [group_id, assignment_id]
      );
    }
    res.json({ success: true, message: 'Assignments assigned to groups successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to assign to groups' });
  }
});


/**
 * Student confirms submission for group+assignment (two-step)
 * POST /api/assignments/:assignmentId/submit
 * body: { group_id }  -> First request: sets submitted=true and submission_at
 * body: { group_id, confirm: true } -> sets confirmed=true and confirmed_at (second step)
 */
// router.post('/:assignmentId/submit', verifyToken, async (req, res, next) => {
//   try {
//     const { assignmentId } = req.params;
//     const { group_id, confirm } = req.body;
//     if (!group_id) return res.status(400).json({ error: 'group_id required' });

//     // ensure users is a member of the group OR group creator
//     const membership = await db.query(
//       `SELECT 1 FROM group_members WHERE group_id=$1 AND users_id=$2
//        UNION
//        SELECT 1 FROM groups_table WHERE id=$1 AND created_by=$2`,
//       [group_id, req.users.id]
//     );
//     if (!membership.rows.length) return res.status(403).json({ error: 'Not a member of this group' });

//     // upsert into group_assignments
//     const existing = await db.query(`SELECT * FROM group_assignments WHERE group_id=$1 AND assignment_id=$2`, [group_id, assignmentId]);

//     if (!existing.rows.length) {
//       // create record
//       const submitted = confirm ? true : true;
//       const submission_at = new Date();
//       const confirmed = confirm ? true : false;
//       const confirmed_at = confirm ? new Date() : null;
//       const q = `INSERT INTO group_assignments (group_id, assignment_id, submitted, confirmed, submission_at, confirmed_at)
//                  VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
//       const vals = [group_id, assignmentId, submitted, confirmed, submission_at, confirmed_at];
//       const { rows } = await db.query(q, vals);
//       return res.json({ status: 'ok', record: rows[0] });
//     } else {
//       // update record
//       const record = existing.rows[0];
//       if (confirm) {
//         const q = `UPDATE group_assignments SET confirmed=true, confirmed_at=$1 WHERE id=$2 RETURNING *`;
//         const { rows } = await db.query(q, [new Date(), record.id]);
//         return res.json({ status: 'confirmed', record: rows[0] });
//       } else {
//         // just mark submitted true
//         const q = `UPDATE group_assignments SET submitted=true, submission_at=$1 WHERE id=$2 RETURNING *`;
//         const { rows } = await db.query(q, [new Date(), record.id]);
//         return res.json({ status: 'submitted', record: rows[0] });
//       }
//     }
//   } catch (err) {
//     next(err);
//   }
// });

/**
 * Admin: view group-wise submission status
 * GET /api/assignments/status
 */
// router.get('/status/all', verifyToken, requireRole('admin'), async (req, res, next) => {
//   try {
//     const q = `
//       SELECT g.id as group_id, g.name as group_name,
//              a.id as assignment_id, a.title,
//              ga.submitted, ga.confirmed, ga.submission_at, ga.confirmed_at
//       FROM groups_table g CROSS JOIN assignments a
//       LEFT JOIN group_assignments ga ON ga.group_id = g.id AND ga.assignment_id = a.id
//       ORDER BY g.id, a.due_date
//     `;
//     const { rows } = await db.query(q);
//     res.json({ rows });
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = router;
