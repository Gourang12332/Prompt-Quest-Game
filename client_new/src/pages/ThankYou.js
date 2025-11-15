import React from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();

  const handleRestart = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Navigate back to login page
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0e201b', marginBottom: '1rem' }}>Quest Completed!</h1>
          <p style={{ fontSize: '1.25rem', color: '#265645', marginBottom: '1.5rem' }}>
            Congratulations on completing PROMPT QUEST!
          </p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <svg style={{ width: '4rem', height: '4rem', color: '#00895e', margin: '0 auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Thank you for participating in this exciting tech challenge. Your skills and determination have brought you to the end of this quest.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={handleRestart}
              style={{
                backgroundColor: '#00895e',
                color: 'white',
                fontWeight: '500',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.3s',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Start New Quest
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
          <p>PROMPT QUEST - A Technical Challenge Experience</p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;