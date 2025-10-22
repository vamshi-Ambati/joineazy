const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

// -------------------------
// Admin/Professor Routes
// -------------------------

// Create assignment - only admin or professor
router.post(
  "/create-assignment",
  verifyToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { title, description, dueDate, oneDriveLink } = req.body;
      if (!title || !dueDate)
        return res
          .status(400)
          .json({ message: "Title and due date are required" });

      const q = `
        INSERT INTO assignments (title, description, due_date, onedrive_link, assigned_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const { rows } = await db.query(q, [
        title,
        description || "",
        dueDate,
        oneDriveLink || "",
        req.user.id,
      ]);

      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Error creating assignment:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update assignment
router.put(
  "/update-assignment/:id",
  verifyToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, dueDate, oneDriveLink } = req.body;

      const q = `
        UPDATE assignments
        SET title=$1, description=$2, due_date=$3, onedrive_link=$4
        WHERE id=$5
        RETURNING *
      `;
      const { rows } = await db.query(q, [
        title,
        description || "",
        dueDate,
        oneDriveLink || "",
        id,
      ]);
      if (!rows.length)
        return res.status(404).json({ message: "Assignment not found" });

      res.json(rows[0]);
    } catch (err) {
      console.error("Error updating assignment:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all assignments
router.get("/get-assignments", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM assignments");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete assignment
router.delete(
  "/delete-assignment/:id",
  verifyToken,
  requireRole(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const { rowCount } = await db.query(
        "DELETE FROM assignments WHERE id=$1",
        [id]
      );
      if (!rowCount)
        return res.status(404).json({ message: "Assignment not found" });
      res.json({ message: "Assignment deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// -------------------------
// Student Submission Routes
// -------------------------

// Student submits an assignment
router.post(
  "/submit/:assignmentId",
  verifyToken,
  requireRole(["student"]),
  async (req, res) => {
    const { assignmentId } = req.params;
    const { fileLink } = req.body; // URL or file path
    if (!fileLink)
      return res
        .status(400)
        .json({ message: "Submission link/file is required" });

    try {
      const q = `
        INSERT INTO submissions (assignment_id, student_id, file_link)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const { rows } = await db.query(q, [assignmentId, req.user.id, fileLink]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Error submitting assignment:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Admin views submissions for an assignment
router.get(
  "/submissions/:assignmentId",
  verifyToken,
  requireRole(["admin"]),
  async (req, res) => {
    const { assignmentId } = req.params;
    try {
      const q = `
        SELECT s.id, s.file_link, s.submitted_at, u.name as student_name, u.email
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        WHERE s.assignment_id = $1
      `;
      const { rows } = await db.query(q, [assignmentId]);
      res.json(rows);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
