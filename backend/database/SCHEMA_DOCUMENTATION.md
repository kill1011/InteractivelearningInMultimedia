# Supabase Schema Documentation

## Overview
This document describes the database schema for the Interactive Multimedia Learning System built with Supabase.

## Database Tables

### 1. **users**
Extended user profile linked to Supabase Auth.
- **id** (UUID): Primary key, references `auth.users`
- **username** (VARCHAR): Unique username
- **email** (VARCHAR): User email
- **full_name** (VARCHAR): Display name
- **role** (ENUM): 'student', 'instructor', or 'admin'
- **avatar_url** (VARCHAR): Profile picture URL
- **bio** (TEXT): User biography
- **created_at, updated_at**: Timestamps
- **last_login**: Last login timestamp

### 2. **lessons**
Course lessons and content.
- **id** (BIGINT): Primary key
- **title, description, content**: Lesson information
- **category**: Topic category
- **order_index**: Display order
- **duration_minutes**: Estimated lesson time
- **media_type**: 'text', 'video', 'audio', or 'interactive'
- **media_url, thumbnail_url**: Resource URLs
- **instructor_id**: Reference to lesson creator
- **is_published**: Visibility flag
- **views_count**: Track popularity

### 3. **quizzes**
Quiz assessments linked to lessons.
- **id** (BIGINT): Primary key
- **lesson_id**: Reference to lessons
- **title, description**: Quiz details
- **time_limit_minutes**: Duration allowed
- **passing_score**: Minimum score to pass
- **max_attempts**: Number of allowed retries
- **shuffle_questions**: Randomize question order
- **show_correct_answers**: Display answers after completion
- **is_published**: Availability

### 4. **questions**
Individual quiz questions.
- **id** (BIGINT): Primary key
- **quiz_id**: Reference to quizzes
- **question_text**: Question content
- **question_type**: 'multiple_choice', 'true_false', 'fill_blank', 'matching'
- **options** (JSONB): Answer choices
- **correct_answer**: Expected answer
- **explanation**: Why answer is correct
- **points**: Score value
- **order_index**: Display order
- **difficulty_level**: 'easy', 'medium', 'hard'

### 5. **quiz_attempts**
Track student quiz submissions.
- **id** (BIGINT): Primary key
- **quiz_id, student_id**: References
- **score, max_score, percentage**: Results
- **passed**: Boolean pass/fail
- **answers** (JSONB): Student responses
- **started_at, completed_at**: Attempt timing
- **time_taken_seconds**: Duration

### 6. **progress**
Track lesson completion status.
- **id** (BIGINT): Primary key
- **student_id, lesson_id**: References
- **status**: 'not_started', 'in_progress', 'completed'
- **completion_percentage**: Progress (0-100)
- **time_spent_seconds**: Total time invested
- **last_accessed**: When student last opened lesson
- **completed_at**: Completion timestamp

### 7. **simulations**
Interactive simulations for lessons.
- **id** (BIGINT): Primary key
- **title, description**: Simulation info
- **type**: audio_visualization, image_processing, video_encoding, color_model, compression
- **config** (JSONB): Simulation settings
- **lesson_id**: Reference to parent lesson
- **order_index**: Display order
- **is_active**: Enabled/disabled flag

### 8. **achievements**
Badges and achievements system.
- **id** (BIGINT): Primary key
- **title, description**: Achievement details
- **icon_name**: Icon identifier
- **requirement_type**: How to earn
- **requirement_value**: Threshold to meet
- **badge_color**: Display color

### 9. **user_achievements**
Bridge table linking users to achievements.
- **id** (BIGINT): Primary key
- **user_id, achievement_id**: Foreign keys
- **earned_at**: When earned

### 10. **leaderboard_cache**
Performance optimization for leaderboard queries.
- **id** (BIGINT): Primary key
- **student_id**: Reference to user
- **total_lessons_completed**: Count
- **total_quizzes_passed**: Count
- **total_achievements**: Count
- **total_time_spent_minutes**: Aggregate
- **rank**: Leaderboard position
- **updated_at**: Last refresh

## Relationships

```
auth.users (Supabase Auth)
    ↓
users (user profiles)
    ├─→ lessons (instructor creates)
    ├─→ progress (student tracks)
    ├─→ quiz_attempts (student takes)
    └─→ user_achievements (earns)

lessons
    ├─→ quizzes
    ├─→ simulations
    └─→ progress

quizzes
    ├─→ questions
    └─→ quiz_attempts

achievements
    ←─ user_achievements
```

## Key Features

### Row Level Security (RLS)
- Users can only access their own data
- Instructors can manage their content
- Published lessons visible to all authenticated users
- Admins have full access

### Indexes
Optimized for common queries:
- User lookups by username/email
- Lesson filtering by instructor/category/published status
- Quiz/progress/attempt tracking
- Achievement management

### JSONB Columns
Flexible data storage for:
- Question options and answers
- Simulation configurations
- Quiz attempt responses

## Setup Instructions

### 1. Create Tables
Copy the content of `schema.sql` and paste it into Supabase SQL Editor (authenticated as owner/service role user).

### 2. Enable RLS
All RLS policies are included in the schema. They are automatically enabled.

### 3. Verify Setup
```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public';

-- Verify RLS is enabled
SELECT tablename FROM pg_tables 
WHERE rowsecurity = true;
```

## Common Queries

### Get student's lesson progress
```sql
SELECT l.title, p.status, p.completion_percentage 
FROM progress p
JOIN lessons l ON p.lesson_id = l.id
WHERE p.student_id = 'user-uuid'
ORDER BY l.order_index;
```

### Get quiz results
```sql
SELECT qa.score, qa.max_score, qa.percentage, qa.completed_at
FROM quiz_attempts qa
WHERE qa.quiz_id = 1 AND qa.student_id = 'user-uuid'
ORDER BY qa.completed_at DESC;
```

### Leaderboard
```sql
SELECT username, total_achievements, total_lessons_completed
FROM leaderboard_cache
ORDER BY rank ASC
LIMIT 10;
```

## Notes
- UUIDs are used for user IDs to integrate with Supabase Auth
- BIGINTs are used for content IDs to allow large datasets
- JSONB is used for flexible configuration storage
- Timestamps use timezone-aware format for international support
- Cascade deletes ensure data consistency when removing users/content
