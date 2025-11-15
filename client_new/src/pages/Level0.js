import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestionsByLevel, getOrCreateAttempt, submitAnswer } from '../utils/api';

const Level0 = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(() => {
    // Restore timer from localStorage or default to 7.5 minutes (450 seconds)
    const savedTime = localStorage.getItem('timer-level-0');
    return savedTime ? parseInt(savedTime) : 450; // 7.5 minutes
  });
  const [levelUnlocked, setLevelUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const timerRef = useRef(null);

  // Load team from localStorage
  useEffect(() => {
    const storedTeam = localStorage.getItem('team');
    if (storedTeam) {
      const parsedTeam = JSON.parse(storedTeam);
      setTeam(parsedTeam);
      
      // Prevent teams from accessing Level 0 if they've moved forward
      if (parsedTeam.currentLevel > 0) {
        // Team has moved forward, redirect to their current level
        navigate(`/level/${parsedTeam.currentLevel}`);
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch questions for level 0
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!team) return;
      
      try {
        const response = await getQuestionsByLevel(0);
        setQuestions(response.data);
        
        // Initialize attempts for each question
        const attemptsData = {};
        for (const question of response.data) {
          const attemptResponse = await getOrCreateAttempt(team._id, question._id);
          attemptsData[question._id] = attemptResponse.data;
        }
        setAttempts(attemptsData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      }
    };

    fetchQuestions();
  }, [team]);

  // Timer logic
  useEffect(() => {
    if (loading || levelUnlocked) return;

    // Save current time to localStorage
    localStorage.setItem('timer-level-0', timeLeft.toString());

    if (timeLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        // Save to localStorage on each update
        localStorage.setItem('timer-level-0', newTime.toString());
        
        if (newTime <= 0) {
          clearInterval(timerId);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    // Store timerId in ref for cleanup
    timerRef.current = timerId;

    return () => {
      clearInterval(timerId);
    };
  }, [loading, timeLeft, levelUnlocked]);

  // Handle answer submission
  const handleAnswerSubmit = async (questionId, answer) => {
    const attempt = attempts[questionId];
    const question = questions.find(q => q._id === questionId);
    
    try {
      const response = await submitAnswer(
        attempt._id,
        answer,
        question.answer,
        question.points,
        team._id
      );
      
      // Update attempts state
      setAttempts(prev => {
        const newAttempts = {
          ...prev,
          [questionId]: response.data.attempt
        };
        // Save to localStorage
        localStorage.setItem(`attempt-${team._id}-${questionId}`, JSON.stringify(response.data.attempt));
        return newAttempts;
      });
      
      // Update team points
      if (response.data.team) {
        setTeam(response.data.team);
        localStorage.setItem('team', JSON.stringify(response.data.team));
      }
      
      return response.data.correct;
    } catch (err) {
      console.error('Failed to submit answer:', err);
      return false;
    }
  };

  // Check password
  const checkPassword = async () => {
    // Form password from answers: ABCDEFG
    const correctPassword = 'ABCDEFG';
    if (password.toUpperCase() === correctPassword) {
      // Set level as unlocked to stop timer
      setLevelUnlocked(true);
      
      // Calculate bonus points based on time remaining
      let bonusPoints = 0;
      if (timeLeft >= 360) { // 6-7.5 minutes
        bonusPoints = 1000;
      } else if (timeLeft >= 180) { // 3-6 minutes
        bonusPoints = 750;
      } else if (timeLeft >= 0) { // 0-3 minutes
        bonusPoints = 500;
      }
      
      // Add bonus points to team
      if (bonusPoints > 0) {
        try {
          const response = await fetch(`http://localhost:5000/api/teams/points`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              teamId: team._id,
              points: bonusPoints
            })
          });
          
          if (response.ok) {
            const updatedTeam = await response.json();
            // Update team in state and localStorage
            setTeam(updatedTeam);
            localStorage.setItem('team', JSON.stringify(updatedTeam));
          }
        } catch (err) {
          console.error('Failed to add bonus points:', err);
        }
      }
      
      // Save that level 0 is completed
      localStorage.setItem('level0-completed', 'true');
      // Navigate to level 1 immediately
      navigate('/level/1');
    } else {
      // If password is wrong, show error but don't navigate
      setPasswordError('Incorrect password. Try again!');
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up on unmount
  useEffect(() => {
    const timerId = timerRef.current;
    return () => {
      // Clear timer when component unmounts
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', border: '4px solid #00895e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#265645' }}>Loading Level 0...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0e201b' }}>Level 0</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Team: {team?.teamName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Points</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00895e' }}>{team?.totalPoints || 0}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft <= 60 ? '#ef4444' : timeLeft <= 150 ? '#eab308' : '#265645' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0e201b', marginBottom: '0.5rem' }}>Warm-up Challenge</h2>
            <p style={{ color: '#6b7280' }}>Answer all 7 questions. The answers form a password to unlock the next level.</p>
            
            {/* Password Entry Form - Always visible */}
            <div style={{ maxWidth: '400px', margin: '1rem auto', padding: '1rem', backgroundColor: '#f1f8f5', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0e201b', marginBottom: '0.5rem' }}>Unlock Next Level</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>Enter the password when you're ready to proceed</p>
              
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
                  placeholder="Enter password"
                />
                {passwordError && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{passwordError}</div>
                )}
              </div>
              
              <button
                onClick={checkPassword}
                style={{
                  backgroundColor: '#00895e',
                  color: 'white',
                  fontWeight: '500',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.3s',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Unlock Next Level
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                attempt={attempts[question._id]}
                onAnswerSubmit={handleAnswerSubmit}
                team={team}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// Question Card Component for Level 0
const QuestionCard = ({ question, attempt, onAnswerSubmit, team }) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setResult(null);
    
    try {
      const isCorrect = await onAnswerSubmit(question._id, answer);
      setResult(isCorrect ? 'correct' : 'incorrect');
      if (isCorrect) {
        setAnswer('');
      }
    } catch (err) {
      setResult('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format keywords as badges
  const renderKeywords = () => {
    return question.keywords.map((keyword, index) => (
      <span 
        key={index} 
        style={{ display: 'inline-block', backgroundColor: '#d5f6e4', color: '#265645', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginRight: '0.5rem', marginBottom: '0.5rem' }}
      >
        {keyword}
      </span>
    ));
  };

  // Determine difficulty color
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'Easy': return { bg: '#dcfce7', text: '#166534' };
      case 'Medium': return { bg: '#fef9c3', text: '#854d0e' };
      case 'Hard': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const difficultyStyle = getDifficultyColor();

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'box-shadow 0.3s' }}>
      {/* Card Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '600', borderRadius: '0.25rem', backgroundColor: difficultyStyle.bg, color: difficultyStyle.text }}>
              {question.difficulty}
            </span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0e201b', marginTop: '0.5rem' }}>
              {question.fullQuestion}
            </h3>
          </div>
          <div style={{ backgroundColor: '#00895e', color: 'white', borderRadius: '9999px', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {question.points}
          </div>
        </div>
        
        <div style={{ marginTop: '0.75rem' }}>
          {renderKeywords()}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1rem' }}>
        {attempt.isSolved ? (
          // Solved state
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '0.5rem' }}>✓ Correct!</div>
            <p style={{ color: '#6b7280' }}>Answer: {question.answer}</p>
          </div>
        ) : (
          // Active state
          <div>
            {/* Answer form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor={`answer-${question._id}`} style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>
                  Your Answer
                </label>
                <input
                  id={`answer-${question._id}`}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
                  placeholder="Enter your answer"
                  disabled={isSubmitting}
                />
              </div>

              {result === 'correct' && (
                <div style={{ color: '#22c55e', fontWeight: '500' }}>Correct!</div>
              )}
              {result === 'incorrect' && (
                <div style={{ color: '#ef4444', fontWeight: '500' }}>Incorrect. Try again!</div>
              )}
              {result === 'error' && (
                <div style={{ color: '#ef4444', fontWeight: '500' }}>Error submitting answer. Please try again.</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: '#00895e',
                  color: 'white',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.3s',
                  opacity: isSubmitting ? '0.7' : '1',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  border: 'none'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Level0;