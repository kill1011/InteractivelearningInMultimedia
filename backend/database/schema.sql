-- ============================================================================
-- SUPABASE SCHEMA FOR INTERACTIVE MULTIMEDIA LEARNING SYSTEM
-- ============================================================================
-- This schema defines all tables and relationships for the learning platform
-- Copy and paste this into your Supabase SQL Editor to create the database

-- ============================================================================
-- 1. USERS TABLE (Extended Profile from auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
  avatar_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 2. LESSONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content TEXT,
  category VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  media_type VARCHAR(50) CHECK (media_type IN ('text', 'video', 'audio', 'interactive')) DEFAULT 'text',
  media_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. QUIZZES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER DEFAULT 30,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  shuffle_questions BOOLEAN DEFAULT FALSE,
  show_correct_answers BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'matching')) DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. QUIZ_ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id BIGSERIAL PRIMARY KEY,
  quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  percentage DECIMAL(5, 2) DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_seconds INTEGER DEFAULT 0,
  UNIQUE(quiz_id, student_id, started_at)
);

-- ============================================================================
-- 6. PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS progress (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  time_spent_seconds INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, lesson_id)
);

-- ============================================================================
-- 7. SIMULATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS simulations (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('audio_visualization', 'image_processing', 'video_encoding', 'color_model', 'compression')) NOT NULL,
  config JSONB,
  lesson_id BIGINT REFERENCES lessons(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  requirement_type VARCHAR(50),
  requirement_value INTEGER DEFAULT 1,
  badge_color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. USER_ACHIEVEMENTS TABLE (Bridge Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- 10. LEADERBOARD_CACHE TABLE (For Performance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_lessons_completed INTEGER DEFAULT 0,
  total_quizzes_passed INTEGER DEFAULT 0,
  total_achievements INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Lessons indexes
CREATE INDEX IF NOT EXISTS idx_lessons_instructor_id ON lessons(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_is_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);

-- Quizzes indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);

-- Quiz attempts indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);

-- Progress indexes
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON progress(status);

-- Simulations indexes
CREATE INDEX IF NOT EXISTS idx_simulations_lesson_id ON simulations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_simulations_type ON simulations(type);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- ============================================================================
-- SEED DATA (Optional)
-- ============================================================================

-- Insert sample achievements
INSERT INTO achievements (title, description, icon_name, requirement_type, requirement_value, badge_color) VALUES
('First Steps', 'Complete your first lesson', 'award', 'lessons_completed', 1, 'blue'),
('Quiz Master', 'Score 100% on any quiz', 'trophy', 'perfect_quiz', 1, 'gold'),
('Dedicated Learner', 'Complete 5 lessons', 'book-open', 'lessons_completed', 5, 'green'),
('Speed Runner', 'Complete a quiz in under 5 minutes', 'zap', 'fast_quiz', 1, 'orange')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Instructors can read student profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Published lessons are readable" ON lessons;
DROP POLICY IF EXISTS "Instructors can manage their lessons" ON lessons;
DROP POLICY IF EXISTS "Users can read own progress" ON progress;
DROP POLICY IF EXISTS "Users can update own progress" ON progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON progress;
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can read own achievements" ON user_achievements;

-- Users: Can read own profile and instructors can read student profiles
CREATE POLICY "Users can read own profile" ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Instructors can read student profiles" ON users FOR SELECT
  USING (auth.jwt() ->> 'role' = 'instructor');

-- Users: Can insert their own profile
CREATE POLICY "Users can insert own profile" ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users: Can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (auth.uid() = id);

-- Lessons: Published lessons are readable by all authenticated users
CREATE POLICY "Published lessons are readable" ON lessons FOR SELECT
  USING (is_published = TRUE OR instructor_id = auth.uid());

CREATE POLICY "Instructors can manage their lessons" ON lessons FOR ALL
  USING (instructor_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Progress: Users can view and update their own progress
CREATE POLICY "Users can read own progress" ON progress FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Users can update own progress" ON progress FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON progress FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Quiz attempts: Users can view their own attempts
CREATE POLICY "Users can read own quiz attempts" ON quiz_attempts FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Users can insert quiz attempts" ON quiz_attempts FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- User achievements: Users can read their own achievements
CREATE POLICY "Users can read own achievements" ON user_achievements FOR SELECT
  USING (user_id = auth.uid());
