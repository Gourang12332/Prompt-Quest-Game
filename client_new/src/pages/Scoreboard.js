import React, { useState, useEffect } from 'react';
import { getScoreboard } from '../utils/api';
import { initSocket, joinScoreboard } from '../utils/socket';

const Scoreboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch initial scoreboard data
  useEffect(() => {
    const fetchScoreboard = async () => {
      try {
        const response = await getScoreboard();
        // Sort by totalPoints descending
        const sortedTeams = response.data.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        setTeams(sortedTeams);
        setLoading(false);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Failed to fetch scoreboard:', err);
        setLoading(false);
      }
    };

    fetchScoreboard();
  }, []);

  // Set up socket connection for real-time updates
  useEffect(() => {
    const socket = initSocket();
    joinScoreboard();

    socket.on('scoreboard-update', (updatedTeams) => {
      // Sort by totalPoints descending
      const sortedTeams = updatedTeams.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      setTeams(sortedTeams);
      setLastUpdate(new Date());
    });

    return () => {
      socket.off('scoreboard-update');
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', border: '4px solid #00895e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#265645' }}>Loading scoreboard...</p>
        </div>
      </div>
    );
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0e201b', margin: 0 }}>Live Scoreboard</h1>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              backgroundColor: '#dcfce7', 
              color: '#166534' 
            }}>
              <span style={{ 
                width: '0.5rem', 
                height: '0.5rem', 
                borderRadius: '50%', 
                backgroundColor: '#22c55e',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}></span>
              LIVE
            </span>
          </div>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Real-time ranking based on current points</p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Last updated: {formatTime(lastUpdate)}</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '80px 1fr 120px 120px 120px', 
            gap: '1rem', 
            padding: '1rem 1.5rem', 
            backgroundColor: '#00895e', 
            color: 'white',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
            <div>Rank</div>
            <div>Team Name</div>
            <div style={{ textAlign: 'center' }}>Solved</div>
            <div style={{ textAlign: 'center' }}>Level</div>
            <div style={{ textAlign: 'right' }}>Points</div>
          </div>

          {teams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#6b7280' }}>No teams have joined yet.</p>
            </div>
          ) : (
            <div>
              {teams.map((team, index) => {
                const isTopThree = index < 3;
                const rankColors = [
                  { bg: '#fef9c3', border: '#fde047', text: '#854d0e', badge: '🥇' }, // Gold
                  { bg: '#f3f4f6', border: '#d1d5db', text: '#374151', badge: '🥈' }, // Silver
                  { bg: '#fde68a', border: '#fcd34d', text: '#ca8a04', badge: '🥉' }, // Bronze
                ];
                const rankColor = isTopThree ? rankColors[index] : { bg: 'transparent', border: 'transparent', text: '#6b7280', badge: '' };
                
                return (
                  <div 
                    key={team._id} 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '80px 1fr 120px 120px 120px', 
                      gap: '1rem', 
                      padding: '1rem 1.5rem', 
                      backgroundColor: isTopThree ? rankColor.bg : index % 2 === 0 ? '#f9fafb' : 'white',
                      transition: 'all 0.2s',
                      borderLeft: isTopThree ? `4px solid ${rankColor.border}` : '4px solid transparent',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '2.5rem', 
                        height: '2.5rem', 
                        borderRadius: '9999px',
                        backgroundColor: isTopThree ? rankColor.border : '#e5e7eb',
                        color: isTopThree ? rankColor.text : '#6b7280',
                        fontWeight: '700',
                        fontSize: '1rem'
                      }}>
                        {isTopThree ? rankColor.badge : index + 1}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#0e201b', fontSize: '1rem' }}>{team.teamName}</span>
                      {index === 0 && (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600', 
                          backgroundColor: '#fef9c3', 
                          color: '#854d0e' 
                        }}>
                          👑 Leader
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        backgroundColor: '#dbeafe', 
                        color: '#1e40af' 
                      }}>
                        {team.solvedQuestionsCount || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        backgroundColor: '#d5f6e4', 
                        color: '#265645' 
                      }}>
                        {team.currentLevel || 0}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span style={{ 
                        fontWeight: '700', 
                        color: '#00895e', 
                        fontSize: '1.125rem' 
                      }}>
                        {team.totalPoints || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>📊 Scoreboard updates automatically as teams earn points in real-time</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
            Rankings are based on total points. In case of ties, teams are ranked by solved questions count.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Scoreboard;