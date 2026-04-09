import React, { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import {
  Trophy,
  Medal,
  Award,
  BookOpen,
  GraduationCap,
  Target
} from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await usersAPI.getLeaderboard();
      setLeaders(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-6 h-6 text-blue-400" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-100';
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
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 mt-1">Top performers in multimedia learning</p>
      </div>

      {/* Top 3 Podium */}
      {leaders.length >= 3 && (
        <div className="flex justify-center items-end gap-4 mb-8">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-2">
              {leaders[1]?.full_name?.charAt(0) || leaders[1]?.username?.charAt(0)}
            </div>
            <div className="w-24 h-24 bg-gray-200 rounded-t-lg flex flex-col items-center justify-end pb-2">
              <Medal className="w-6 h-6 text-gray-500 mb-1" />
              <span className="font-bold text-gray-700">2nd</span>
            </div>
            <p className="font-medium text-gray-900 mt-2 text-sm">{leaders[1]?.full_name || leaders[1]?.username}</p>
            <p className="text-xs text-gray-500">{leaders[1]?.completed_lessons} lessons</p>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-2 ring-4 ring-yellow-200">
              {leaders[0]?.full_name?.charAt(0) || leaders[0]?.username?.charAt(0)}
            </div>
            <div className="w-28 h-32 bg-gradient-to-b from-yellow-100 to-amber-200 rounded-t-lg flex flex-col items-center justify-end pb-2">
              <Trophy className="w-8 h-8 text-yellow-600 mb-1" />
              <span className="font-bold text-amber-800">1st</span>
            </div>
            <p className="font-bold text-gray-900 mt-2">{leaders[0]?.full_name || leaders[0]?.username}</p>
            <p className="text-sm text-gray-500">{leaders[0]?.completed_lessons} lessons</p>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-2">
              {leaders[2]?.full_name?.charAt(0) || leaders[2]?.username?.charAt(0)}
            </div>
            <div className="w-24 h-16 bg-amber-100 rounded-t-lg flex flex-col items-center justify-end pb-2">
              <Medal className="w-6 h-6 text-amber-600 mb-1" />
              <span className="font-bold text-amber-800">3rd</span>
            </div>
            <p className="font-medium text-gray-900 mt-2 text-sm">{leaders[2]?.full_name || leaders[2]?.username}</p>
            <p className="text-xs text-gray-500">{leaders[2]?.completed_lessons} lessons</p>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Full Rankings</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {leaders.map((leader, index) => (
            <div
              key={leader.id}
              className={`p-4 flex items-center gap-4 ${getRankStyle(index + 1)}`}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                {getRankIcon(index + 1)}
              </div>
              <div className="w-8 text-center font-bold text-gray-700">
                #{index + 1}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {leader.full_name?.charAt(0) || leader.username?.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{leader.full_name || leader.username}</h4>
                <p className="text-sm text-gray-500">@{leader.username}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{leader.completed_lessons}</span>
                  <span className="text-gray-500">lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{leader.quizzes_taken || 0}</span>
                  <span className="text-gray-500">quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">
                    {leader.average_score ? Math.round(leader.average_score) : '-'}%
                  </span>
                  <span className="text-gray-500">avg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{leader.achievements || 0}</span>
                  <span className="text-gray-500">achievements</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-700">
          <strong>How rankings work:</strong> Students are ranked based on lessons completed, 
          quiz scores, and achievements earned. Keep learning to climb the leaderboard!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
