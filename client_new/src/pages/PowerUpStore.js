import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyPowerUp } from '../utils/api';

const PowerUpStore = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load team from localStorage
  useEffect(() => {
    const storedTeam = localStorage.getItem('team');
    if (storedTeam) {
      setTeam(JSON.parse(storedTeam));
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Power-up options
  const powerUps = [
    {
      id: 1,
      type: 'timeBoost',
      name: 'Extra Time Boost',
      description: 'Adds 5 minutes to your current level timer',
      points: 100,
      icon: '⏰'
    },
    {
      id: 2,
      type: 'freeHint',
      name: 'Free Hint Unlock',
      description: 'Reveals a hint for any question without spending attempts',
      points: 75,
      icon: '💡'
    }
  ];

  const handlePurchase = async (powerUp) => {
    if (team.totalPoints < powerUp.points) {
      setError('Not enough points to purchase this power-up');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await buyPowerUp(team._id, powerUp.type, powerUp.points);
      
      // Update team
      setTeam(response.data.team);
      localStorage.setItem('team', JSON.stringify(response.data.team));
      
      // Show success message
      alert(`Successfully purchased ${powerUp.name}!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase power-up');
    } finally {
      setLoading(false);
    }
  };

  if (!team) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', border: '4px solid #00895e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#265645' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0e201b', marginBottom: '0.5rem' }}>Power-Up Store</h1>
          <p style={{ color: '#6b7280' }}>Enhance your gameplay with these special abilities</p>
          
          <div style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '9999px', padding: '0.5rem 1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <span style={{ color: '#6b7280', marginRight: '0.5rem' }}>Your Points:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00895e' }}>{team.totalPoints}</span>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.375rem', color: '#b91c1c', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {powerUps.map((powerUp) => (
            <div 
              key={powerUp.id} 
              style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'box-shadow 0.3s' }}
            >
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '2rem', marginRight: '1rem' }}>{powerUp.icon}</div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0e201b' }}>{powerUp.name}</h3>
                    <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>{powerUp.description}</p>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00895e' }}>{powerUp.points} pts</div>
                  
                  <button
                    onClick={() => handlePurchase(powerUp)}
                    disabled={loading || team.totalPoints < powerUp.points}
                    style={{
                      padding: '0.5rem 1.5rem',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      transition: 'background-color 0.3s',
                      backgroundColor: team.totalPoints < powerUp.points ? '#e5e7eb' : '#3ab284',
                      color: team.totalPoints < powerUp.points ? '#9ca3af' : 'white',
                      border: 'none',
                      cursor: team.totalPoints < powerUp.points ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Purchasing...' : 'Buy Now'}
                  </button>
                </div>

                {team.totalPoints < powerUp.points && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#ef4444' }}>
                    You need {powerUp.points - team.totalPoints} more points
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              color: '#265645', 
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Level
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerUpStore;