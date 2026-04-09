export interface User {
  id: string | number; // Supabase uses UUID (string), database might use both
  username: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  avatar_url?: string;
  created_at?: string;
  last_login?: string;
  completed_lessons?: number;
  passed_quizzes?: number;
}

export interface Lesson {
  id: number | string;
  title: string;
  description: string;
  content: string;
  category: string;
  order_index: number;
  duration_minutes: number;
  media_type: 'text' | 'video' | 'audio' | 'interactive';
  media_url?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  instructor_id?: number | string;
  instructor_name?: string;
  is_published: boolean;
  created_at?: string;
  user_status?: 'not_started' | 'in_progress' | 'completed';
  completion_percentage?: number;
  time_spent_seconds?: number;
}

export interface Quiz {
  id: number | string;
  lesson_id: number | string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  is_published: boolean;
  lesson_title?: string;
  question_count?: number;
}

export interface Question {
  id: number | string;
  quiz_id: number | string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
  options: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  order_index: number;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  student_id: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  answers?: any[];
  started_at: string;
  completed_at?: string;
  time_taken_seconds: number;
  quiz_title?: string;
  lesson_title?: string;
}

export interface Progress {
  id?: number;
  student_id: number;
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  time_spent_seconds: number;
  last_accessed: string;
  completed_at?: string;
  lesson_title?: string;
  category?: string;
  duration_minutes?: number;
  best_quiz_score?: number;
}

export interface Simulation {
  id: number;
  title: string;
  description: string;
  type: 'audio_visualization' | 'image_processing' | 'video_encoding' | 'color_model' | 'compression';
  config: any;
  lesson_id?: number;
  lesson_title?: string;
  order_index: number;
  is_active: boolean;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned_at?: string;
}

export interface DashboardStats {
  overallStats: {
    total_lessons: number;
    completed_lessons: number;
    in_progress_lessons: number;
    average_completion: number;
    total_time_spent: number;
  };
  quizStats: {
    total_attempts: number;
    passed_quizzes: number;
    average_score: number;
    highest_score: number;
  };
  recentActivity: {
    type: string;
    name: string;
    date: string;
    progress: number;
  }[];
  categoryProgress: {
    category: string;
    total_lessons: number;
    completed_lessons: number;
    average_completion: number;
  }[];
  achievements: Achievement[];
  streakDays: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role?: string;
}
