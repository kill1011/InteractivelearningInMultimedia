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
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

const InstructorPanel: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'quizzes' | 'students'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await progressAPI.getInstructorAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Instructor Panel</h1>
        <p className="text-gray-500 mt-1">Manage content and view student progress</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'lessons', label: 'Lessons', icon: BookOpen },
          { id: 'quizzes', label: 'Quizzes', icon: GraduationCap },
          { id: 'students', label: 'Students', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.classStats?.total_students || 0}</p>
                  <p className="text-sm text-gray-500">Total Students</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.classStats?.active_students || 0}</p>
                  <p className="text-sm text-gray-500">Active Students</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(analytics?.classStats?.average_completion || 0)}%
                  </p>
                  <p className="text-sm text-gray-500">Avg Completion</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.classStats?.lessons_accessed || 0}</p>
                  <p className="text-sm text-gray-500">Lessons Accessed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Lesson Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.lessonPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students_completed" fill="#10b981" name="Completed" />
                    <Bar dataKey="students_started" fill="#3b82f6" name="Started" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quiz Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.quizPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average_score" fill="#8b5cf6" name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Lesson Management</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Lesson
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {analytics?.lessonPerformance?.map((lesson: any) => (
              <div key={lesson.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                  <p className="text-sm text-gray-500">{lesson.category}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{lesson.students_started}</p>
                    <p className="text-gray-500">Started</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">{lesson.students_completed}</p>
                    <p className="text-gray-500">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-blue-600">{Math.round(lesson.average_completion)}%</p>
                    <p className="text-gray-500">Avg Progress</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Quiz Management</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Quiz
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {analytics?.quizPerformance?.map((quiz: any) => (
              <div key={quiz.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                  <p className="text-sm text-gray-500">{quiz.lesson_title}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{quiz.total_attempts}</p>
                    <p className="text-gray-500">Attempts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-blue-600">{Math.round(quiz.average_score)}%</p>
                    <p className="text-gray-500">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">{quiz.passed_count}</p>
                    <p className="text-gray-500">Passed</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Student Performance</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {analytics?.studentPerformance?.map((student: any) => (
              <div key={student.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                  {student.full_name?.charAt(0) || student.username?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{student.full_name || student.username}</h4>
                  <p className="text-sm text-gray-500">@{student.username}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-blue-600">{student.lessons_completed}</p>
                    <p className="text-gray-500">Lessons</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">{student.quizzes_taken}</p>
                    <p className="text-gray-500">Quizzes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-purple-600">
                      {student.average_score ? Math.round(student.average_score) : '-'}%
                    </p>
                    <p className="text-gray-500">Avg Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorPanel;
