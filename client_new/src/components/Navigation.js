import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);

  // Load team from localStorage
  useEffect(() => {
    const storedTeam = localStorage.getItem('team');
    if (storedTeam) {
      setTeam(JSON.parse(storedTeam));
    }
  }, []);

  // Developer reset function - clears all data and returns to registration
  const handleDeveloperReset = () => {
    // Clear all localStorage data
    localStorage.removeItem('team');
    localStorage.removeItem('password-game-completed');
    localStorage.removeItem('level0-completed');
    
    // Clear all question states (find all keys starting with 'questions-')
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('questions-') || key.startsWith('timer-level-') || key.startsWith('attempt-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Redirect to registration
    navigate('/');
    window.location.reload(); // Force reload to reset all state
  };

  // Show navigation on all pages except the root login page
  const showNavigation = location.pathname === '/' ||
                        location.pathname.startsWith('/level/') || 
                        location.pathname === '/scoreboard' || 
                        location.pathname === '/powerups';

  return (
    <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0e201b' }}>PROMPT QUEST</span>
            </div>
            {location.pathname !== '/' && (
              <div style={{ display: 'flex', marginLeft: '1.5rem', flexDirection: 'row', gap: '2rem' }}>
                <button
                  onClick={() => navigate('/scoreboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.25rem',
                    borderBottom: location.pathname === '/scoreboard' ? '2px solid #00895e' : '2px solid transparent',
                    color: location.pathname === '/scoreboard' ? '#0e201b' : '#6b7280',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Scoreboard
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {team && location.pathname !== '/' && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#4b5563', marginRight: '1rem' }}>Team: {team.teamName}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', backgroundColor: '#00895e', color: 'white' }}>
                  {team.totalPoints} pts
                </span>
              </div>
            )}
            {/* Developer Reset Button - Only visible when logged in */}
            {team && location.pathname !== '/' && (
              <button
                onClick={handleDeveloperReset}
                title="Developer: Reset and return to registration"
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: 0.8
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.8'}
              >
                🔄 Dev Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;