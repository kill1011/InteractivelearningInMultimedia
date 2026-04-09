import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Backend API for non-Supabase operations
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API (using Supabase)
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;
    localStorage.setItem('token', data.session.access_token);
    return data.user;
  },
  
  register: async (data: { email: string; password: string; full_name: string; username: string; role: string }) => {
    // Sign up the user
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          username: data.username,
          role: data.role,
        },
      },
    });
    if (error) throw error;
    
    // Create user profile in users table
    const userId = authData.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from('users').insert([{
        id: userId,
        email: data.email,
        full_name: data.full_name,
        username: data.username,
        role: data.role,
      }]);
      if (profileError) throw profileError;
    }
    
    // Auto sign in the user after registration
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (signInError) throw signInError;
    
    localStorage.setItem('token', signInData.session.access_token);
    return signInData.user;
  },
  
  getMe: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) throw profileError;
    return userProfile;
  },
  
  updateProfile: async (data: any) => {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.user.id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },
  
  changePassword: async (data: { password: string }) => {
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) throw error;
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('token');
    if (error) throw error;
  },
};

// Lessons API
export const lessonsAPI = {
  getAll: async (params?: any) => {
    let query = supabase.from('lessons').select('*');
    
    if (params?.published) {
      query = query.eq('is_published', true);
    }
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    const { data, error } = await query.order('order_index', { ascending: true });
    if (error) throw error;
    return { data };
  },

  getById: async (id: number) => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data };
  },

  updateProgress: (id: number, data: any) =>
    api.post(`/lessons/${id}/progress`, data),
  create: (data: any) => api.post('/lessons', data),
  update: (id: number, data: any) => api.put(`/lessons/${id}`, data),
  deleteLesson: (id: number) => api.delete(`/lessons/${id}`),
  getStatistics: (id: number) => api.get(`/lessons/${id}/statistics`),
};

// Quizzes API
export const quizzesAPI = {
  getAll: () => api.get('/quizzes'),
  getById: (id: number) => api.get(`/quizzes/${id}`),
  start: (id: number) => api.post(`/quizzes/${id}/start`),
  submit: (id: number, data: any) => api.post(`/quizzes/${id}/submit`, data),
  create: (data: any) => api.post('/quizzes', data),
  addQuestion: (id: number, data: any) => api.post(`/quizzes/${id}/questions`, data),
  update: (id: number, data: any) => api.put(`/quizzes/${id}`, data),
  delete: (id: number) => api.delete(`/quizzes/${id}`),
};

// Progress API
export const progressAPI = {
  getDashboard: () => api.get('/progress/dashboard'),
  getLessons: () => api.get('/progress/lessons'),
  getQuizzes: () => api.get('/progress/quizzes'),
  getInstructorAnalytics: () => api.get('/progress/instructor/analytics'),
};

// Simulations API
export const simulationsAPI = {
  getAll: (params?: any) => api.get('/simulations', { params }),
  getById: (id: number) => api.get(`/simulations/${id}`),
  create: (data: any) => api.post('/simulations', data),
  update: (id: number, data: any) => api.put(`/simulations/${id}`, data),
  delete: (id: number) => api.delete(`/simulations/${id}`),
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  getAchievements: (id: number) => api.get(`/users/${id}/achievements`),
  getLeaderboard: () => api.get('/users/leaderboard/top'),
  updateRole: (id: number, role: string) => api.put(`/users/${id}/role`, { role }),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export default api;
