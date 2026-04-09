import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, initDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Interactive Multimedia Learning System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      lessons: '/api/lessons',
      quizzes: '/api/quizzes',
      progress: '/api/progress',
      auth: '/api/auth'
    },
    documentation: 'See backend/README.md for API documentation'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Progress API Routes
app.get('/api/progress/dashboard', (req, res) => {
  // Return dashboard stats
  res.json({
    data: {
      overallStats: {
        completed_lessons: 0,
        total_lessons: 0,
        total_time_spent: 0,
        average_quiz_score: 0
      },
      recentActivity: [],
      upcomingDeadlines: []
    }
  });
});

app.get('/api/progress/:userId', (req, res) => {
  res.json({
    data: {
      lessons: [],
      quizzes: [],
      progress: []
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      apiHealth: '/api/health'
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('Connecting to Supabase...');
    await testConnection();
    console.log('Initializing database...');
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
