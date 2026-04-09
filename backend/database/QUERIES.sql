-- ============================================================================
-- USEFUL QUERIES AND UTILITIES
-- ============================================================================
-- Use these queries in your Supabase SQL Editor for common operations

-- ============================================================================
-- 1. ADMIN OPERATIONS
-- ============================================================================

-- Get all users with their stats
SELECT 
  u.id,
  u.username,
  u.email,
  u.role,
  COUNT(DISTINCT p.lesson_id) as lessons_completed,
  COUNT(DISTINCT CASE WHEN qa.passed = true THEN qa.id END) as quizzes_passed,
  COUNT(DISTINCT ua.achievement_id) as achievements_earned
FROM users u
LEFT JOIN progress p ON u.id = p.student_id AND p.status = 'completed'
LEFT JOIN quiz_attempts qa ON u.id = qa.student_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id
ORDER BY u.created_at DESC;

-- Get instructor's lessons and stats
SELECT 
  l.id,
  l.title,
  l.category,
  l.is_published,
  COUNT(DISTINCT p.student_id) as students_enrolled,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.student_id END) as students_completed,
  COUNT(q.id) as quiz_count
FROM lessons l
LEFT JOIN progress p ON l.id = p.lesson_id
LEFT JOIN quizzes q ON l.id = q.lesson_id
WHERE l.instructor_id = '<instructor-uuid>'
GROUP BY l.id
ORDER BY l.order_index;

-- ============================================================================
-- 2. ANALYTICS QUERIES
-- ============================================================================

-- Platform engagement metrics
SELECT 
  COUNT(DISTINCT id) as total_users,
  COUNT(DISTINCT CASE WHEN role = 'student' THEN id END) as total_students,
  COUNT(DISTINCT CASE WHEN role = 'instructor' THEN id END) as total_instructors,
  MAX(last_login) as most_recent_login
FROM users;

-- Lesson popularity
SELECT 
  l.id,
  l.title,
  l.views_count,
  COUNT(DISTINCT p.student_id) as enrolled_students,
  AVG(p.completion_percentage) as avg_completion,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.student_id END) as completed_count
FROM lessons l
LEFT JOIN progress p ON l.id = p.lesson_id
WHERE l.is_published = true
GROUP BY l.id
ORDER BY l.views_count DESC
LIMIT 10;

-- Quiz difficulty analysis
SELECT 
  q.id,
  q.title,
  COUNT(qa.id) as total_attempts,
  COUNT(DISTINCT qa.student_id) as unique_students,
  ROUND(SUM(CASE WHEN qa.passed = true THEN 1 ELSE 0 END)::numeric / COUNT(qa.id) * 100, 2) as pass_rate,
  ROUND(AVG(qa.percentage), 2) as avg_score
FROM quizzes q
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
GROUP BY q.id
ORDER BY pass_rate ASC;

-- Student progress summary
SELECT 
  u.username,
  u.email,
  COUNT(DISTINCT p.lesson_id) as lessons_started,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.lesson_id END) as lessons_completed,
  ROUND(COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.lesson_id END)::numeric / NULLIF(COUNT(DISTINCT p.lesson_id), 0) * 100, 2) as completion_rate,
  COUNT(DISTINCT CASE WHEN qa.passed = true THEN qa.id END) as quizzes_passed
FROM users u
LEFT JOIN progress p ON u.id = p.student_id
LEFT JOIN quiz_attempts qa ON u.id = qa.student_id
WHERE u.role = 'student'
GROUP BY u.id, u.username, u.email
ORDER BY lessons_completed DESC;

-- ============================================================================
-- 3. MAINTENANCE QUERIES
-- ============================================================================

-- Find orphaned progress records (should not exist with cascade delete)
SELECT p.* 
FROM progress p
LEFT JOIN users u ON p.student_id = u.id
LEFT JOIN lessons l ON p.lesson_id = l.id
WHERE u.id IS NULL OR l.id IS NULL;

-- Find inactive users (no login in 30 days)
SELECT 
  id,
  username,
  email,
  last_login,
  NOW() - last_login as days_inactive
FROM users
WHERE last_login IS NOT NULL 
  AND NOW() - last_login > INTERVAL '30 days'
ORDER BY last_login DESC;

-- Reset a user's progress (for admin)
DELETE FROM progress 
WHERE student_id = '<user-uuid>';

-- Archive old quiz attempts (older than 1 year)
-- First, export to external storage if needed
SELECT * FROM quiz_attempts 
WHERE completed_at < NOW() - INTERVAL '1 year';

-- Delete archived attempts
DELETE FROM quiz_attempts 
WHERE completed_at < NOW() - INTERVAL '1 year';

-- ============================================================================
-- 4. DATA IMPORT/EXPORT HELPERS
-- ============================================================================

-- Export student progress as CSV
COPY (
  SELECT 
    u.username,
    u.email,
    l.title as lesson_title,
    p.status,
    p.completion_percentage,
    p.last_accessed,
    p.completed_at
  FROM progress p
  JOIN users u ON p.student_id = u.id
  JOIN lessons l ON p.lesson_id = l.id
  WHERE u.role = 'student'
  ORDER BY u.username, l.order_index
) TO STDOUT WITH CSV HEADER;

-- Export quiz results as CSV
COPY (
  SELECT 
    u.username,
    u.email,
    q.title as quiz_title,
    qa.score,
    qa.max_score,
    qa.percentage,
    qa.passed,
    qa.completed_at
  FROM quiz_attempts qa
  JOIN users u ON qa.student_id = u.id
  JOIN quizzes q ON qa.quiz_id = q.id
  ORDER BY u.username, q.title, qa.completed_at DESC
) TO STDOUT WITH CSV HEADER;

-- ============================================================================
-- 5. LEADERBOARD UPDATES
-- ============================================================================

-- Update leaderboard cache (run periodically)
TRUNCATE TABLE leaderboard_cache;

INSERT INTO leaderboard_cache (student_id, total_lessons_completed, total_quizzes_passed, total_achievements, total_time_spent_minutes)
SELECT 
  u.id,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.lesson_id END),
  COUNT(DISTINCT CASE WHEN qa.passed = true THEN qa.id END),
  COUNT(DISTINCT ua.achievement_id),
  SUM(p.time_spent_seconds) / 60
FROM users u
LEFT JOIN progress p ON u.id = p.student_id
LEFT JOIN quiz_attempts qa ON u.id = qa.student_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.role = 'student'
GROUP BY u.id;

-- Update rankings
UPDATE leaderboard_cache 
SET rank = ranked.rank
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY total_achievements DESC, total_quizzes_passed DESC, total_lessons_completed DESC) as rank
  FROM leaderboard_cache
) ranked
WHERE leaderboard_cache.id = ranked.id;

-- ============================================================================
-- 6. USER MANAGEMENT
-- ============================================================================

-- Promote user to instructor
UPDATE users 
SET role = 'instructor' 
WHERE id = '<user-uuid>';

-- Grant achievement to user
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
VALUES ('<user-uuid>', 1, NOW())
ON CONFLICT DO NOTHING;

-- Remove user's achievements
DELETE FROM user_achievements 
WHERE user_id = '<user-uuid>';

-- ============================================================================
-- 7. CONTENT MANAGEMENT
-- ============================================================================

-- Publish all lessons by an instructor
UPDATE lessons 
SET is_published = true 
WHERE instructor_id = '<instructor-uuid>';

-- Add quiz to lesson
INSERT INTO quizzes (lesson_id, title, description, time_limit_minutes, passing_score, is_published)
VALUES (
  1,
  'Quick Quiz',
  'A quick assessment',
  15,
  70,
  false
);

-- Duplicate a quiz with questions
WITH quiz_copy AS (
  INSERT INTO quizzes (lesson_id, title, description, time_limit_minutes, passing_score, is_published)
  SELECT lesson_id, title || ' (Copy)', description, time_limit_minutes, passing_score, false
  FROM quizzes
  WHERE id = 1
  RETURNING id, id as new_id
)
INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points)
SELECT 
  quiz_copy.new_id,
  q.question_text,
  q.question_type,
  q.options,
  q.correct_answer,
  q.explanation,
  q.points
FROM questions q, quiz_copy
WHERE q.quiz_id = 1;

-- Reorder lessons
UPDATE lessons 
SET order_index = row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_index) as row_num
  FROM lessons
  WHERE instructor_id = '<instructor-uuid>'
) numbered
WHERE lessons.id = numbered.id;

-- ============================================================================
-- 8. DEBUGGING QUERIES
-- ============================================================================

-- Check table row counts
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'quizzes', COUNT(*) FROM quizzes
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'quiz_attempts', COUNT(*) FROM quiz_attempts
UNION ALL
SELECT 'progress', COUNT(*) FROM progress
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'user_achievements', COUNT(*) FROM user_achievements;

-- Check size of tables
SELECT 
  table_name,
  round(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.TABLES 
WHERE table_schema = 'public'
ORDER BY (data_length + index_length) DESC;

-- List all indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check for missing indexes on foreign keys
SELECT 
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
  AND referenced_table_name IS NOT NULL;
