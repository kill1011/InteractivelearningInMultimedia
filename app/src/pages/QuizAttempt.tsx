import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesAPI } from '../services/api';
import type { Quiz, Question } from '../types';
import {
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trophy,
  RotateCcw
} from 'lucide-react';

const QuizAttempt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) {
      fetchQuiz(parseInt(id));
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted && !isSubmitted) {
      handleSubmit();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, timeLeft, isSubmitted]);

  const fetchQuiz = async (quizId: number) => {
    try {
      const response = await quizzesAPI.getById(quizId);
      setQuiz(response.data.quiz);
      setQuestions(response.data.questions);
      setPreviousAttempts(response.data.attempts || []);
      setTimeLeft(response.data.quiz.time_limit_minutes * 60);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    }
  };

  const startQuiz = async () => {
    try {
      const response = await quizzesAPI.start(parseInt(id!));
      setAttemptId(response.data.attemptId);
      setIsStarted(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start quiz');
    }
  };

  const handleAnswer = (answer: string) => {
    const questionId = questions[currentQuestion].id;
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, answer };
        return updated;
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleSubmit = async () => {
    try {
      const timeTaken = (quiz?.time_limit_minutes || 0) * 60 - timeLeft;
      const response = await quizzesAPI.submit(parseInt(id!), {
        answers,
        attemptId,
        timeTakenSeconds: timeTaken,
      });
      setResult(response.data.result);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Start Screen
  if (!isStarted && !isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/quizzes')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Quizzes
        </button>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <p className="text-gray-500 mb-6">{quiz.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Time Limit</p>
              <p className="text-lg font-semibold">{quiz.time_limit_minutes} minutes</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Questions</p>
              <p className="text-lg font-semibold">{questions.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Passing Score</p>
              <p className="text-lg font-semibold">{quiz.passing_score}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Max Attempts</p>
              <p className="text-lg font-semibold">{quiz.max_attempts}</p>
            </div>
          </div>

          {previousAttempts.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Previous Attempts</p>
              <div className="space-y-2">
                {previousAttempts.slice(0, 3).map((attempt, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">
                      Attempt {previousAttempts.length - idx}
                    </span>
                    <span className={`font-medium ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {attempt.percentage}% {attempt.passed ? '(Passed)' : '(Failed)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={startQuiz}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (isSubmitted && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            result.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {result.passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <AlertCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h2 className={`text-2xl font-bold mb-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result.passed ? 'Congratulations!' : 'Quiz Failed'}
          </h2>
          <p className="text-gray-500 mb-6">
            {result.passed
              ? 'You have successfully passed the quiz!'
              : 'Keep practicing and try again.'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{result.score}</p>
              <p className="text-sm text-gray-500">Score</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{result.maxScore}</p>
              <p className="text-sm text-gray-500">Max Score</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{result.percentage}%</p>
              <p className="text-sm text-gray-500">Percentage</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/quizzes')}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Back to Quizzes
            </button>
            {!result.passed && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Interface
  const question = questions[currentQuestion];
  const currentAnswer = answers.find((a) => a.questionId === question.id)?.answer;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
          timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        }`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">{question.question_text}</h3>

        <div className="space-y-3">
          {question.options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                currentAnswer === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  currentAnswer === option
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {currentAnswer === option && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                idx === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers.find((a) => a.questionId === questions[idx].id)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizAttempt;
