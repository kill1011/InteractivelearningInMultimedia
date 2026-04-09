import React, { useEffect, useState } from 'react';
import { progressAPI } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  BookOpen,
  GraduationCap,
  Clock,
  TrendingUp,
  Award,
  CheckCircle,
  Circle,
  PlayCircle
} from 'lucide-react';

const Progress: React.FC = () => {
  const [lessonProgress, setLessonProgress] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const [lessonsRes, quizzesRes] = await Promise.all([
        progressAPI.getLessons(),
        progressAPI.getQuizzes()
      ]);
      setLessonProgress(lessonsRes.data.progress);
      setQuizHistory(quizzesRes.data.attempts);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  // Prepare chart data
  const categoryData = lessonProgress.reduce((acc: any, lesson: any) => {
    const existing = acc.find((item: any) => item.name === lesson.category);
    if (existing) {
      existing.completed += lesson.status === 'completed' ? 1 : 0;
      existing.total += 1;
    } else {
      acc.push({
        name: lesson.category,
        completed: lesson.status === 'completed' ? 1 : 0,
        total: 1
      });
    }
    return acc;
  }, []);

  const quizScoreData = quizHistory.slice(0, 10).map((attempt, idx) => ({
    name: `Quiz ${quizHistory.length - idx}`,
    score: attempt.percentage
  })).reverse();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedLessons = lessonProgress.filter(l => l.status === 'completed').length;
  const inProgressLessons = lessonProgress.filter(l => l.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500 mt-1">Track your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
              <p className="text-sm text-gray-500">Lessons Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgressLessons}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{quizHistory.length}</p>
              <p className="text-sm text-gray-500">Quizzes Taken</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(lessonProgress.reduce((acc, l) => acc + (l.time_spent_seconds || 0), 0))}
              </p>
              <p className="text-sm text-gray-500">Time Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Progress */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Progress by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                <Bar dataKey="total" fill="#e5e7eb" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Scores */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Recent Quiz Scores
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lesson Progress List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Lesson Progress</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {lessonProgress.map((lesson) => (
            <div key={lesson.lesson_id} className="p-4 flex items-center gap-4">
              {getStatusIcon(lesson.status)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                <p className="text-sm text-gray-500">{lesson.category}</p>
              </div>
              <div className="text-right">
                {lesson.completion_percentage > 0 && (
                  <div className="w-24">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${lesson.completion_percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(lesson.completion_percentage)}%
                    </p>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500 min-w-[80px] text-right">
                {formatTime(lesson.time_spent_seconds || 0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Quiz History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {quizHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No quizzes taken yet</p>
            </div>
          ) : (
            quizHistory.map((attempt) => (
              <div key={attempt.id} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  attempt.passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {attempt.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{attempt.quiz_title}</h4>
                  <p className="text-sm text-gray-500">{attempt.lesson_title}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {attempt.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(attempt.completed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
