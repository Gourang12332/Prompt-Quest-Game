import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam, updateTeamPoints } from '../utils/api';

// Password game questions - 16 questions with some images
const PASSWORD_QUESTIONS = [
  { id: 1, question: 'First letter of the alphabet?', answer: 'A', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop' },
  { id: 2, question: 'Second letter of the alphabet?', answer: 'B', image: null },
  { id: 3, question: 'Third letter of the alphabet?', answer: 'C', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
  { id: 4, question: 'Fourth letter of the alphabet?', answer: 'D', image: null },
  { id: 5, question: 'Fifth letter of the alphabet?', answer: 'E', image: null },
  { id: 6, question: 'Sixth letter of the alphabet?', answer: 'F', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop' },
  { id: 7, question: 'Seventh letter of the alphabet?', answer: 'G', image: null },
  { id: 8, question: 'Eighth letter of the alphabet?', answer: 'H', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
  { id: 9, question: 'Ninth letter of the alphabet?', answer: 'I', image: null },
  { id: 10, question: 'Tenth letter of the alphabet?', answer: 'J', image: null },
  { id: 11, question: 'Eleventh letter of the alphabet?', answer: 'K', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop' },
  { id: 12, question: 'Twelfth letter of the alphabet?', answer: 'L', image: null },
  { id: 13, question: 'Thirteenth letter of the alphabet?', answer: 'M', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop' },
  { id: 14, question: 'Fourteenth letter of the alphabet?', answer: 'N', image: null },
  { id: 15, question: 'Fifteenth letter of the alphabet?', answer: 'O', image: null },
  { id: 16, question: 'Sixteenth letter of the alphabet?', answer: 'P', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
];

// Final password (hardcoded in frontend)
const FINAL_PASSWORD = 'ABCDEFGHIJKLMNOP';

const TeamLogin = () => {
  const [teamName, setTeamName] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [member3, setMember3] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamCreated, setTeamCreated] = useState(false);
  const [team, setTeam] = useState(null);
  
  // Password game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const navigate = useNavigate();

  // Redirect to appropriate page if already logged in
  useEffect(() => {
    const storedTeam = localStorage.getItem('team');
    if (storedTeam) {
      const parsedTeam = JSON.parse(storedTeam);
      const passwordGameCompleted = localStorage.getItem('password-game-completed');
      if (passwordGameCompleted) {
        // Password game completed, go to question bank (Round 2)
        navigate('/question-bank');
      }
      // Otherwise stay on login page to play password game
    }
  }, [navigate]);

  const handleTimeUp = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Award default 1000 points
    const currentTeam = team || JSON.parse(localStorage.getItem('team') || '{}');
    if (currentTeam && currentTeam._id) {
      try {
        await updateTeamPoints(currentTeam._id, 1000);
        const updatedTeam = { ...currentTeam, totalPoints: (currentTeam.totalPoints || 0) + 1000 };
        setTeam(updatedTeam);
        localStorage.setItem('team', JSON.stringify(updatedTeam));
      } catch (err) {
        console.error('Failed to update points:', err);
      }
    }
    
    setGameCompleted(true);
    localStorage.setItem('password-game-completed', 'true');
    // Navigate to question bank (Round 2) after time up
    setTimeout(() => {
      navigate('/question-bank');
    }, 2000);
  }, [team, navigate]);

  // Timer logic
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeElapsed(elapsed);
      
      // Max 10 minutes (600 seconds)
      if (elapsed >= 600) {
        handleTimeUp();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameCompleted, handleTimeUp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createTeam(teamName, [member1, member2, member3]);
      const createdTeam = response.data;
      localStorage.setItem('team', JSON.stringify(createdTeam));
      setTeam(createdTeam);
      setTeamCreated(true);
      setGameStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInput = (e) => {
    const value = e.target.value.toUpperCase();
    setPasswordInput(value);
    setPasswordError('');

    // Convert to lowercase and trim for comparison (used in both conditions)
    const normalizedInput = value.trim().toLowerCase();

    if (currentQuestionIndex < PASSWORD_QUESTIONS.length) {
      const currentQuestion = PASSWORD_QUESTIONS[currentQuestionIndex];
      const expectedAnswer = currentQuestion.answer;
      const normalizedExpected = expectedAnswer.trim().toLowerCase();
      
      // Check if the input matches the current question's answer
      if (normalizedInput === normalizedExpected) {
        // Correct answer - move to next question
        setCompletedQuestions([...completedQuestions, currentQuestionIndex]);
        setCurrentQuestionIndex(prev => prev + 1);
        setPasswordInput('');
        setPasswordError('');
      } else if (normalizedInput.length >= normalizedExpected.length && normalizedInput !== normalizedExpected) {
        // Wrong answer - show error
        setPasswordError('Wrong answer! Try again.');
        setTimeout(() => {
          setPasswordInput('');
          setPasswordError('');
        }, 2000);
      }
    } else if (currentQuestionIndex === PASSWORD_QUESTIONS.length) {
      // All questions completed, check final password
      const normalizedFinalPassword = FINAL_PASSWORD.trim().toLowerCase();
      if (normalizedInput === normalizedFinalPassword) {
        handleFinalPasswordCorrect();
      } else if (normalizedInput.length >= normalizedFinalPassword.length && normalizedInput !== normalizedFinalPassword) {
        setPasswordError('Incorrect final password! Please check all your answers.');
        setTimeout(() => {
          setPasswordInput('');
          setPasswordError('');
        }, 3000);
      }
    }
  };

  const handleFinalPasswordCorrect = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setGameCompleted(true);
    localStorage.setItem('password-game-completed', 'true');
    
    // Calculate coins based on time taken
    const timeInSeconds = timeElapsed;
    const maxTime = 600; // 10 minutes
    let coins = 0;
    
    if (timeInSeconds <= 300) { // 0-5 minutes
      coins = 2000;
    } else if (timeInSeconds <= 450) { // 5-7.5 minutes
      coins = 1500;
    } else if (timeInSeconds <= 600) { // 7.5-10 minutes
      coins = 1000;
    } else {
      coins = 1000; // Default
    }
    
    // Award coins to team
    if (team) {
      try {
        await updateTeamPoints(team._id, coins);
        const updatedTeam = { ...team, totalPoints: (team.totalPoints || 0) + coins };
        setTeam(updatedTeam);
        localStorage.setItem('team', JSON.stringify(updatedTeam));
      } catch (err) {
        console.error('Failed to update points:', err);
      }
    }
    
    // Mark password game as completed and navigate to question bank (Round 2)
    localStorage.setItem('password-game-completed', 'true');
    setTimeout(() => {
      navigate('/question-bank');
    }, 1500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    return Math.max(0, 600 - timeElapsed);
  };

  const getCurrentQuestion = () => {
    if (currentQuestionIndex < PASSWORD_QUESTIONS.length) {
      return PASSWORD_QUESTIONS[currentQuestionIndex];
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0e201b', marginBottom: '0.5rem' }}>PROMPT QUEST</h1>
          <p style={{ color: '#265645' }}>Tech Club Event</p>
          {teamCreated && (
            <p style={{ color: '#00895e', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '500' }}>Round 1 - Password Game</p>
          )}
        </div>

        {!teamCreated ? (
          // Team Name Input Form
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="teamName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>
                Team Name
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="Enter your team name"
                required
              />
            </div>

            <div>
              <label htmlFor="member1" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>
                Team Member 1
              </label>
              <input
                id="member1"
                type="text"
                value={member1}
                onChange={(e) => setMember1(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="Enter team member 1 name"
                required
              />
            </div>

            <div>
              <label htmlFor="member2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>
                Team Member 2
              </label>
              <input
                id="member2"
                type="text"
                value={member2}
                onChange={(e) => setMember2(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="Enter team member 2 name"
                required
              />
            </div>

            <div>
              <label htmlFor="member3" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>
                Team Member 3
              </label>
              <input
                id="member3"
                type="text"
                value={member3}
                onChange={(e) => setMember3(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="Enter team member 3 name"
                required
              />
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#00895e',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.3s',
                opacity: loading ? '0.7' : '1',
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none'
              }}
            >
              {loading ? 'Creating Team...' : 'Start Quest'}
            </button>
          </form>
        ) : (
          // Password Game
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Team Info */}
            <div style={{ backgroundColor: '#f1f8f5', padding: '1rem', borderRadius: '0.375rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#265645', margin: 0 }}>
                <strong>Team:</strong> {team?.teamName}
              </p>
            </div>

            {/* Timer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f1f8f5', borderRadius: '0.375rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Time Remaining</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getTimeRemaining() <= 60 ? '#ef4444' : '#00895e', margin: 0 }}>
                  {formatTime(getTimeRemaining())}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Progress</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00895e', margin: 0 }}>
                  {completedQuestions.length} / {PASSWORD_QUESTIONS.length}
                </p>
              </div>
            </div>

            {/* Display all completed questions stacked */}
            {completedQuestions.length > 0 && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {completedQuestions.map((questionIdx) => {
                  const question = PASSWORD_QUESTIONS[questionIdx];
                  return (
                    <div 
                      key={question.id} 
                      style={{ 
                        backgroundColor: '#dcfce7', 
                        padding: '1rem', 
                        borderRadius: '0.375rem',
                        border: '1px solid #22c55e'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>
                          Question {questionIdx + 1} ✓
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0e201b', marginBottom: '0.5rem' }}>
                        {question.question}
                      </h4>
                      {question.image && (
                        <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                          <img 
                            src={question.image} 
                            alt="Question illustration" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px', 
                              borderRadius: '0.375rem',
                              border: '1px solid #e5e7eb'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <p style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '500', margin: 0 }}>
                        Answer: {question.answer}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current Question */}
            {!gameCompleted && getCurrentQuestion() && (
              <div style={{ backgroundColor: '#f1f8f5', padding: '1.5rem', borderRadius: '0.375rem', border: '2px solid #00895e' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Question {currentQuestionIndex + 1} of {PASSWORD_QUESTIONS.length}
                </p>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0e201b', marginBottom: '1rem' }}>
                  {getCurrentQuestion().question}
                </h3>
                
                {getCurrentQuestion().image && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <img 
                      src={getCurrentQuestion().image} 
                      alt="Question illustration" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '250px', 
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Single Password Field for all questions */}
            {!gameCompleted && currentQuestionIndex < PASSWORD_QUESTIONS.length && (
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', marginTop: '1rem' }}>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                  Enter Answer (Password Field - Use for all questions)
                </label>
                <input
                  id="password"
                  type="text"
                  value={passwordInput}
                  onChange={handlePasswordInput}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: passwordError ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none',
                    fontSize: '1.125rem',
                    textAlign: 'center',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                  placeholder="Type your answer here"
                  autoFocus
                />
                {passwordError && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                    {passwordError}
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                  Answer the current question above using this field
                </p>
              </div>
            )}

            {/* Final Password Check */}
            {!gameCompleted && currentQuestionIndex === PASSWORD_QUESTIONS.length && (
              <div style={{ backgroundColor: '#d5f6e4', padding: '1.5rem', borderRadius: '0.375rem', border: '2px solid #00895e' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0e201b', marginBottom: '0.5rem', textAlign: 'center' }}>
                  🎉 All Questions Completed!
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#265645', marginBottom: '1rem', textAlign: 'center' }}>
                  Enter the complete password to proceed
                </p>
                
                <div>
                  <label htmlFor="finalPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>
                    Final Password
                  </label>
                  <input
                    id="finalPassword"
                    type="text"
                    value={passwordInput}
                    onChange={handlePasswordInput}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: passwordError ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      outline: 'none',
                      fontSize: '1.125rem',
                      textAlign: 'center',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}
                    placeholder="Enter complete password"
                    autoFocus
                  />
                  {passwordError && (
                    <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                      {passwordError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Game Completed */}
            {gameCompleted && (
              <div style={{ backgroundColor: '#d5f6e4', padding: '1.5rem', borderRadius: '0.375rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0e201b', marginBottom: '0.5rem' }}>
                  {timeElapsed >= 600 ? '⏰ Time\'s Up!' : '✅ Password Correct!'}
                </h3>
                <p style={{ color: '#265645', marginBottom: '1rem' }}>
                  {timeElapsed >= 600 
                    ? 'You have been awarded 1000 default points. Redirecting to Level 0...'
                    : `Congratulations! You completed in ${formatTime(timeElapsed)}. Redirecting to Level 0...`
                  }
                </p>
              </div>
            )}

            {/* Progress Indicator */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {PASSWORD_QUESTIONS.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: completedQuestions.includes(idx) ? '#22c55e' : idx === currentQuestionIndex ? '#00895e' : '#e5e7eb',
                      border: idx === currentQuestionIndex ? '2px solid #00895e' : 'none'
                    }}
                    title={`Question ${idx + 1}: ${completedQuestions.includes(idx) ? 'Completed' : idx === currentQuestionIndex ? 'Current' : 'Pending'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>15 teams competing • 15-minute levels • Real-time scoreboard</p>
        </div>
      </div>
    </div>
  );
};

export default TeamLogin;