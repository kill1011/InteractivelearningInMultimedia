import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Quizzes from './pages/Quizzes';
import QuizAttempt from './pages/QuizAttempt';
import Simulations from './pages/Simulations';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import InstructorPanel from './pages/InstructorPanel';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="lessons" element={
                <ProtectedRoute>
                  <Lessons />
                </ProtectedRoute>
              } />
              <Route path="lessons/:id" element={
                <ProtectedRoute>
                  <LessonDetail />
                </ProtectedRoute>
              } />
              <Route path="quizzes" element={
                <ProtectedRoute>
                  <Quizzes />
                </ProtectedRoute>
              } />
              <Route path="quizzes/:id" element={
                <ProtectedRoute>
                  <QuizAttempt />
                </ProtectedRoute>
              } />
              <Route path="simulations" element={
                <ProtectedRoute>
                  <Simulations />
                </ProtectedRoute>
              } />
              <Route path="progress" element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="instructor" element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <InstructorPanel />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
