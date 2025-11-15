import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getQuestionsByLevel, 
  getOrCreateAttempt, 
  submitAnswer, 
  buyAttempts,
  getHint,
  updateTeamLevel
} from '../utils/api';

const Level = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(() => {
    // Restore timer from localStorage or default to 20 minutes for level 1
    const savedTime = level ? localStorage.getItem(`timer-level-${level}`) : null;
    return savedTime ? parseInt(savedTime) : 20 * 60; // 20 minutes
  });
  const [levelCompleted, setLevelCompleted] = useState(false);
  const timerRef = useRef(null);

  // Load team from localStorage
  useEffect(() => {
    const storedTeam = localStorage.getItem('team');
    if (storedTeam) {
      const parsedTeam = JSON.parse(storedTeam);
      setTeam(parsedTeam);
      
      // Prevent teams from accessing levels they've already completed or going back
      const currentLevel = parseInt(level);
      if (parsedTeam.currentLevel !== currentLevel) {
        // Team is trying to access a different level, redirect to their current level
        navigate(`/level/${parsedTeam.currentLevel}`);
      }
    } else {
      navigate('/');
    }
  }, [navigate, level]);

  // Fetch questions for this level
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!team || !level) return;
      
      try {
        const response = await getQuestionsByLevel(level);
        setQuestions(response.data);
        
        // Initialize attempts for each question
        const attemptsData = {};
        for (const question of response.data) {
          // Check if we have saved attempt data
          const savedAttempt = localStorage.getItem(`attempt-${team._id}-${question._id}`);
          if (savedAttempt) {
            attemptsData[question._id] = JSON.parse(savedAttempt);
          } else {
            const attemptResponse = await getOrCreateAttempt(team._id, question._id);
            attemptsData[question._id] = attemptResponse.data;
            // Save to localStorage
            localStorage.setItem(`attempt-${team._id}-${question._id}`, JSON.stringify(attemptResponse.data));
          }
        }
        setAttempts(attemptsData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      }
    };

    fetchQuestions();
  }, [level, team]);

  // Timer logic
  useEffect(() => {
    if (loading || !level) return;

    // Save current time to localStorage
    localStorage.setItem(`timer-level-${level}`, timeLeft.toString());

    if (timeLeft <= 0) {
      setLevelCompleted(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        // Save to localStorage on each update
        localStorage.setItem(`timer-level-${level}`, newTime.toString());
        
        if (newTime <= 0) {
          clearInterval(timerRef.current);
          setLevelCompleted(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, timeLeft, level]);

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

  // Handle buying additional attempts
  const handleBuyAttempts = async (questionId) => {
    const attempt = attempts[questionId];
    const pointsToDeduct = 75; // Fixed deduction for buying attempts
    
    try {
      const response = await buyAttempts(team._id, attempt._id, pointsToDeduct);
      
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
      
      // Update team
      setTeam(response.data.team);
      localStorage.setItem('team', JSON.stringify(response.data.team));
    } catch (err) {
      console.error('Failed to buy attempts:', err);
    }
  };

  // Handle getting hint
  const handleGetHint = async (questionId, useFreeHint = false) => {
    const attempt = attempts[questionId];
    
    try {
      const response = await getHint(attempt._id, useFreeHint);
      
      // Update attempts state
      setAttempts(prev => {
        const newAttempts = {
          ...prev,
          [questionId]: response.data
        };
        // Save to localStorage
        localStorage.setItem(`attempt-${team._id}-${questionId}`, JSON.stringify(response.data));
        return newAttempts;
      });
    } catch (err) {
      console.error('Failed to get hint:', err);
    }
  };

  // Finish level with bonus points based on time remaining
  const finishLevel = async () => {
    if (team && parseInt(level) === 1) {
      // Calculate bonus points based on time remaining (20 minutes = 1200 seconds)
      let bonusPoints = 0;
      if (timeLeft >= 900) { // 15-20 minutes
        bonusPoints = 500;
      } else if (timeLeft >= 600) { // 10-15 minutes
        bonusPoints = 400;
      } else if (timeLeft >= 300) { // 5-10 minutes
        bonusPoints = 300;
      } else if (timeLeft >= 0) { // 0-5 minutes
        bonusPoints = 200;
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
      
      // Show completion message and navigate to thank you page
      alert(`Congratulations! You have completed Level 1. You earned ${bonusPoints} bonus points for your time!`);
      
      // Navigate to thank you page
      navigate('/thank-you');
    }
  };

  // Move to next level
  const moveToNextLevel = async () => {
    if (team) {
      const nextLevel = parseInt(level) + 1;
      
      // Only allow navigation to level 1 (no level 2)
      if (nextLevel > 1) {
        // If trying to go beyond level 1, show completion message and navigate to thank you page
        alert('Congratulations! You have completed all levels of PROMPT QUEST.');
        navigate('/thank-you');
        return;
      }
      
      try {
        // Clear timer for current level
        localStorage.removeItem(`timer-level-${level}`);
        
        // Update team level in backend
        await updateTeamLevel(team._id, nextLevel);
        
        // Update team in localStorage
        const updatedTeam = { ...team, currentLevel: nextLevel };
        localStorage.setItem('team', JSON.stringify(updatedTeam));
        
        // Navigate to next level
        navigate(`/level/${nextLevel}`);
      } catch (err) {
        console.error('Failed to update team level:', err);
        // Still navigate even if backend update fails
        navigate(`/level/${nextLevel}`);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear timer when component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', border: '4px solid #00895e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#265645' }}>Loading level {level}...</p>
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0e201b' }}>Level {level}</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Team: {team?.teamName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Points</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00895e' }}>{team?.totalPoints || 0}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft <= 60 ? '#ef4444' : timeLeft <= 300 ? '#eab308' : '#265645' }}>
                {formatTime(timeLeft)}
              </span>
              {parseInt(level) < 1 ? (
                <button
                  onClick={moveToNextLevel}
                  style={{
                    backgroundColor: '#3ab284',
                    color: 'white',
                    fontWeight: '500',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Next Level
                </button>
              ) : (
                <button
                  onClick={moveToNextLevel}
                  style={{
                    backgroundColor: '#00895e',
                    color: 'white',
                    fontWeight: '500',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Finish Game
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {levelCompleted ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0e201b', marginBottom: '1rem' }}>Time's Up!</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Level {level} has ended.</p>
            {parseInt(level) < 1 ? (
              <button
                onClick={moveToNextLevel}
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
                Continue to Level {parseInt(level) + 1}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={finishLevel}
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
                  Finish Level & Get Bonus Points
                </button>
                <button
                  onClick={moveToNextLevel}
                  style={{
                    backgroundColor: '#3ab284',
                    color: 'white',
                    fontWeight: '500',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.375rem',
                    transition: 'background-color 0.3s',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Finish Without Bonus
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                attempt={attempts[question._id]}
                onAnswerSubmit={handleAnswerSubmit}
                onBuyAttempts={handleBuyAttempts}
                onGetHint={handleGetHint}
                team={team}
                setTeam={setTeam}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ question, attempt, onAnswerSubmit, onBuyAttempts, onGetHint, team, setTeam }) => {
  const [showFullQuestion, setShowFullQuestion] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handlePurchase = async () => {
    // Check if team has enough points to purchase the question
    if (team.totalPoints < question.points) {
      alert(`You need ${question.points - team.totalPoints} more points to purchase this question.`);
      return;
    }
    
    // Deduct points for purchasing the question
    try {
      const response = await fetch(`http://localhost:5000/api/teams/points`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: team._id,
          points: -question.points // Negative points to deduct
        })
      });
      
      if (response.ok) {
        const updatedTeam = await response.json();
        // Update team in state and localStorage
        setTeam(updatedTeam);
        localStorage.setItem('team', JSON.stringify(updatedTeam));
        setShowFullQuestion(true);
      } else {
        alert('Failed to purchase question. Please try again.');
      }
    } catch (err) {
      console.error('Failed to purchase question:', err);
      alert('Failed to purchase question. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setResult(null);
    
    try {
      const isCorrect = await onAnswerSubmit(question._id, answer);
      setResult(isCorrect ? 'correct' : 'incorrect');
      setAnswer('');
    } catch (err) {
      setResult('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyAttempts = () => {
    onBuyAttempts(question._id);
  };

  const handleGetHint = (useFreeHint = false) => {
    onGetHint(question._id, useFreeHint);
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
              {showFullQuestion ? question.fullQuestion : '???'}
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
        {!showFullQuestion ? (
          // Preview state
          <div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Keywords: {question.keywords.join(', ')}
            </p>
            <button
              onClick={handlePurchase}
              style={{
                width: '100%',
                backgroundColor: '#3ab284',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.3s',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Purchase Question ({question.points} points)
            </button>
          </div>
        ) : attempt.isSolved ? (
          // Solved state
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '0.5rem' }}>✓ Solved!</div>
            <p style={{ color: '#6b7280' }}>Well done! You earned {question.points} points.</p>
          </div>
        ) : attempt.isLocked ? (
          // Locked state
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.5rem' }}>Locked</div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No attempts remaining.</p>
            <button
              onClick={handleBuyAttempts}
              style={{
                width: '100%',
                backgroundColor: '#00895e',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.3s',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Buy More Attempts (75 points)
            </button>
          </div>
        ) : (
          // Active state
          <div>
            {/* Hint section */}
            {attempt.hasSeenHint && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#dbeafe', borderRadius: '0.375rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                  <span style={{ fontWeight: '600' }}>Hint:</span> {question.hint}
                </p>
              </div>
            )}

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
                <div style={{ color: '#22c55e', fontWeight: '500' }}>Correct! Well done.</div>
              )}
              {result === 'incorrect' && (
                <div style={{ color: '#ef4444', fontWeight: '500' }}>Incorrect. Try again!</div>
              )}
              {result === 'error' && (
                <div style={{ color: '#ef4444', fontWeight: '500' }}>Error submitting answer. Please try again.</div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
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
                
                {!attempt.hasSeenHint && (
                  <button
                    type="button"
                    onClick={() => handleGetHint()}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      color: '#4b5563',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    💡 Hint
                  </button>
                )}
              </div>
            </form>

            {/* Attempts counter */}
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Attempts remaining: {attempt.attemptsLeft}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Level;