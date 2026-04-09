import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizzesAPI } from '../services/api';
import type { Quiz } from '../types';
import {
  GraduationCap,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

const Quizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizzesAPI.getAll();
      setQuizzes(response.data.quizzes);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
        <p className="text-gray-500 mt-1">Test your knowledge and track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              <p className="text-sm text-gray-500">Available Quizzes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500">Average Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {quiz.lesson_title}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{quiz.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quiz.time_limit_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Pass: {quiz.passing_score}%
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {quiz.max_attempts} attempts
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {quiz.question_count} questions
                  </span>
                </div>
              </div>
              <Link
                to={`/quizzes/${quiz.id}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Quiz
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No quizzes available</h3>
          <p className="text-gray-500 mt-1">Check back later for new assessments</p>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
