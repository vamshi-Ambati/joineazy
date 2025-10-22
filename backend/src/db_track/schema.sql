-- Drop if exists (useful during development)
DROP TABLE IF EXISTS group_assignments CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups_table CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email, password, role)
VALUES ('nithin', 'nithin@example.com', 'yourpassword', 'student');


CREATE TABLE groups_table (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
  group_id INTEGER REFERENCES groups_table(id) ON DELETE CASCADE,
  users_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (group_id, users_id)
);

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  onedrive_link TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_assignments (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups_table(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  submitted BOOLEAN DEFAULT false,
  confirmed BOOLEAN DEFAULT false,
  submission_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- sample index for faster lookups
CREATE INDEX idx_group_assignments_group ON group_assignments(group_id);
CREATE INDEX idx_group_assignments_assignment ON group_assignments(assignment_id);
