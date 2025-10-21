-- src/migrations/schema.sql

-- Drop if exists (useful during development)
DROP TABLE IF EXISTS group_assignments CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups_table CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- students (also used for admins: role column)
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'student' or 'admin'
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO students (name, email, password, role)
VALUES ('nithin', 'nithin@example.com', 'yourpassword', 'student');


-- groups
CREATE TABLE groups_table (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_by INTEGER REFERENCES students(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- group_members (many-to-many: group <-> student)
CREATE TABLE group_members (
  group_id INTEGER REFERENCES groups_table(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES students(id) ON DELETE SET NULL,
  PRIMARY KEY (group_id, student_id)
);

-- assignments
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  onedrive_link TEXT,
  created_by INTEGER REFERENCES students(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- group_assignments (submission tracking)
CREATE TABLE group_assignments (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups_table(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  submitted BOOLEAN DEFAULT false,
  confirmed BOOLEAN DEFAULT false,
  submission_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES students(id) ON DELETE SET NULL
);

-- sample index for faster lookups
CREATE INDEX idx_group_assignments_group ON group_assignments(group_id);
CREATE INDEX idx_group_assignments_assignment ON group_assignments(assignment_id);
