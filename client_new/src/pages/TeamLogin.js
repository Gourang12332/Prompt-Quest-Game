import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam, updateTeamPoints } from '../utils/api';

// Helper function to convert number to Roman numeral
function numberToRoman(num) {
  if (num === 0) return ""; // zero times → empty string requirement
  const map = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let res = "";
  for (const [value, numeral] of map) {
    while (num >= value) {
      res += numeral;
      num -= value;
    }
  }
  return res;
}

// Password game rules
const rules = [
  {
    id: 1,
    description: "Password must be at least 5 characters long.",
    validate: (pw) => pw.length >= 5,
  },
  {
    id: 2,
    description: "Password must include at least one number",
    validate: (pw) => /\d/.test(pw),
  },
  {
    id: 3,
    description: "Password must include one uppercase letter",
    validate: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: 4,
    description: "Password must include a special character",
    validate: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
  {
    id: 5,
    description: "Password must the number of featured posts on our linkedin page",
    validate: (pw) => pw.includes("2"),
  },
  {
    id: 6,
    description: "Sum of all the digits in the password must be 11",
    validate: (pw) => {
      const digits = pw.match(/\d/g);
      if (!digits) return false;
      const sum = digits.reduce((a, b) => a + Number(b), 0);
      return sum === 11;
    },
  },
  {
    id: 7,
    description: 'Your password must include the output of the following:\nint main() {\n\tchar s[] = "geeksforgeeks";\n\tprintf("%c%c%c\\n", s[0], s[5], s[8]);\n\treturn 0;\n}',
    validate: (pw) => pw.toLowerCase().includes("gfg"),
  },
  {
    id: 8,
    description: "The password includes the inauguration year of the college",
    validate: (pw) => pw.includes("2013"),
  },
  {
    id: 9,
    description: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span>The password includes the word written here:</span>
        <img
          src="/images/q9.jpg"
          alt="Question 9"
          style={{ width: '384px', maxWidth: '100%', height: '192px', objectFit: 'contain', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    ),
    validate: (pw) => pw.toLowerCase().includes("glow"),
  },
  {
    id: 10,
    description: "The password includes the answer to the riddle on our instagram story",
    validate: (pw) => pw.toLowerCase().includes("campusmantri"),
  },
  {
    id: 11,
    description: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span>The password includes the pokemon shown here:</span>
        <img
          src="/images/q11.jpg"
          alt="Question 11"
          style={{ width: '384px', maxWidth: '100%', height: '192px', objectFit: 'contain', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    ),
    validate: (pw) => pw.toLowerCase().includes("charmander"),
  },
  {
    id: 12,
    description: "The password includes the number of times the letter 'g' (either uppercase or lowercase) appears in your password in roman numerals",
    validate: (pw) => {
      // 1. Count occurrences of 'g' or 'G'
      const count = (pw.match(/g/gi) || []).length;
      // 2. Convert count → Roman numeral
      const roman = numberToRoman(count);
      // 3. Password must include that roman numeral (case-insensitive)
      return roman && pw.includes(roman);
    },
  },
  {
    id: 13,
    description: "The password includes the first word from the Problem Of The Day on GeeksForGeeks webpage",
    validate: (pw) => {
      // TODO: Get the problem of the day
      return pw.toLowerCase().includes("minimum");
    },
  },
  {
    id: 14,
    description: 'The password includes the output of the following:\nint a = 10;\nprintf("%d", a+++a)',
    validate: (pw) => pw.includes("21"),
  },
  {
    id: 15,
    description: 'The password includes the number of unique letters of the alphabet(case-insensitive) that appear in your password in roman numerals',
    validate: (pw) => {
      // 1. Extract letters only (ignore digits/symbols)
      const letters = pw.toLowerCase().match(/[a-z]/g) || [];
      // 2. Count unique letters
      const uniqueCount = new Set(letters).size;
      // 3. Convert to Roman numeral
      const roman = numberToRoman(uniqueCount);
      // 4. Check if password contains that Roman numeral (case insensitive)
      return roman && pw.includes(roman);
    },
  },
];

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
  const [password, setPassword] = useState("");
  const [seen, setSeen] = useState(15);
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

  // Unlock rules automatically
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    
    const currentRule = rules[seen - 1];
    if (currentRule && currentRule.validate(password)) {
      if (seen < rules.length) {
        setSeen(seen + 1);
      }
    }
  }, [password, seen, gameStarted, gameCompleted]);

  // Check if all rules are satisfied
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    
    if (seen === rules.length && rules.every((r) => r.validate(password))) {
      handleGameComplete();
    }
  }, [password, seen, gameStarted, gameCompleted]);

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

  const handleGameComplete = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setGameCompleted(true);
    localStorage.setItem('password-game-completed', 'true');
    
    // Calculate coins based on time taken
    const timeInSeconds = timeElapsed;
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

  // Only visible rules (1 → seen)
  let visibleRules = rules.slice(0, seen);

  // Sort: unsatisfied → satisfied
  visibleRules = visibleRules.sort((a, b) => {
    const a_ok = a.validate(password);
    const b_ok = b.validate(password);
    // Unsatisfied rules first
    if (!a_ok && b_ok) return -1;
    if (a_ok && !b_ok) return 1;
    // Both satisfied → sort by ID descending
    if (a_ok && b_ok) return b.id - a.id;
    // both unsatisfied → keep original order
    return 0;
  });

  const allRulesSatisfied = seen === rules.length && rules.every((r) => r.validate(password));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '800px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
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
                  {seen - 1} / {rules.length}
                </p>
              </div>
            </div>

            {/* Password Input */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                Type your password...
              </label>
              <input
                id="password"
                type="text"
                className="w-full p-3 border rounded-xl shadow-sm text-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Type your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={gameCompleted}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  outline: 'none',
                  fontSize: '1.125rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
                autoFocus
              />
            </div>

            {/* Rules Display */}
            <div style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0e201b', marginBottom: '1rem' }}>Password Rules</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {visibleRules.map((rule) => {
                  const ok = rule.validate(password);
                  return (
                    <div
                      key={rule.id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        border: ok ? '1px solid #22c55e' : '1px solid #ef4444',
                        backgroundColor: ok ? '#dcfce7' : '#fee2e2',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{ok ? "✔️" : "❌"}</span>
                      <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '500', whiteSpace: 'pre-wrap', flex: 1 }}>
                        {rule.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Success Message */}
            {allRulesSatisfied && !gameCompleted && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1.25rem'
                }}
              >
                🎉 All rules satisfied!
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
                    ? 'You have been awarded 1000 default points. Redirecting to Question Bank...'
                    : `Congratulations! You completed in ${formatTime(timeElapsed)}. Redirecting to Question Bank...`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>Tech Club Event • Password Challenge • Real-time scoreboard</p>
        </div>
      </div>
    </div>
  );
};

export default TeamLogin;
