import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lessonsAPI } from '../services/api';
import type { Lesson, Quiz } from '../types';
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Play,
  CheckCircle,
  GraduationCap,
  FlaskConical,
  ChevronRight
} from 'lucide-react';

const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (id) {
      fetchLesson(parseInt(id));
    }
  }, [id]);

  const fetchLesson = async (lessonId: number) => {
    try {
      const response = await lessonsAPI.getById(lessonId);
      setLesson(response.data.lesson);
      setQuiz(response.data.quiz);
      setSimulations(response.data.simulations);
      setProgress(response.data.lesson.completion_percentage || 0);
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (newProgress: number) => {
    if (!id) return;
    
    try {
      const status = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
      await lessonsAPI.updateProgress(parseInt(id), {
        completion_percentage: newProgress,
        time_spent_seconds: 60,
        status
      });
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Lesson not found</h2>
        <Link to="/lessons" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Back to Lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/lessons"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Lessons
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <BookOpen className="w-20 h-20 text-white/30" />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {lesson.category}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {lesson.duration_minutes} minutes
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-500 capitalize">
              <Play className="w-4 h-4" />
              {lesson.media_type}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-gray-600 mt-2">{lesson.description}</p>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Your Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => updateProgress(Math.min(100, progress + 25))}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark Progress
              </button>
              <button
                onClick={() => updateProgress(100)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Complete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Content</h2>
        <div
          className="prose prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      </div>

      {/* Simulations */}
      {simulations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            Interactive Simulations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulations.map((sim: any) => (
              <Link
                key={sim.id}
                to={`/simulations?type=${sim.type}`}
                className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{sim.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{sim.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {quiz && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-600" />
            Assessment
          </h2>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">{quiz.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>{quiz.time_limit_minutes} minutes</span>
                <span>Passing: {quiz.passing_score}%</span>
              </div>
            </div>
            <Link
              to={`/quizzes/${quiz.id}`}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Quiz
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDetail;
