CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_date DATE DEFAULT CURRENT_DATE,
  opening_state TEXT NOT NULL,
  practice_offered TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  breath_reflection TEXT,
  closing_feeling TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
