-- Supabase SQL Schema for Study Engine
-- Run this script in your Supabase Project -> SQL Editor

-- 1. App State Table (Unified JSON Sync for instant stateless cloud persistence)
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY DEFAULT 'main_db',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated reads and writes (or restrict as needed for your auth setup)
CREATE POLICY "Allow public read/write access to app_state"
  ON app_state
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Optional Relational Tables (For direct SQL querying & reporting)

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT DEFAULT 1,
  description TEXT
);

CREATE TABLE IF NOT EXISTS concepts (
  id TEXT PRIMARY KEY,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  explanation TEXT,
  definitions JSONB DEFAULT '[]'::jsonb,
  formulas JSONB DEFAULT '[]'::jsonb,
  key_facts JSONB DEFAULT '[]'::jsonb,
  examples JSONB DEFAULT '[]'::jsonb,
  source_document TEXT,
  source_page INT,
  "order" INT DEFAULT 1,
  prerequisite_concept_ids JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS source_documents (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filename TEXT,
  page_count INT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preview_text TEXT,
  extracted_text TEXT
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  concept_id TEXT REFERENCES concepts(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  category TEXT,
  type TEXT,
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  tolerance DOUBLE PRECISION,
  units TEXT,
  explanation TEXT,
  source_page INT
);

CREATE TABLE IF NOT EXISTS mistakes (
  id TEXT PRIMARY KEY,
  question_id TEXT,
  concept_id TEXT REFERENCES concepts(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  concept_name TEXT,
  question_text TEXT,
  student_answer TEXT,
  correct_answer TEXT,
  mistake_type TEXT,
  diagnosis TEXT,
  targeted_remediation TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolution_attempts INT DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mastery (
  concept_id TEXT PRIMARY KEY REFERENCES concepts(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  status TEXT DEFAULT 'UNLEARNED',
  last_practiced TIMESTAMP WITH TIME ZONE,
  next_review_due TIMESTAMP WITH TIME ZONE,
  interval_days INT DEFAULT 1,
  ease_factor DOUBLE PRECISION DEFAULT 2.5,
  repetitions INT DEFAULT 0,
  consecutive_correct INT DEFAULT 0,
  total_attempts INT DEFAULT 0,
  total_mistakes INT DEFAULT 0
);

-- Enable RLS for all relational tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery ENABLE ROW LEVEL SECURITY;

-- Create permissive public policies for development access
CREATE POLICY "Public subjects policy" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public topics policy" ON topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public concepts policy" ON concepts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public source_documents policy" ON source_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public questions policy" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public mistakes policy" ON mistakes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public mastery policy" ON mastery FOR ALL USING (true) WITH CHECK (true);
