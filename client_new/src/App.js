import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import TeamLogin from './pages/TeamLogin';
import QuestionBank from './pages/QuestionBank';
import Level0 from './pages/Level0';
import Level from './pages/Level';
import Scoreboard from './pages/Scoreboard';
import ThankYou from './pages/ThankYou';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<TeamLogin />} />
          <Route path="/question-bank" element={<QuestionBank />} />
          <Route path="/level/0" element={<Level0 />} />
          <Route path="/level/:level" element={<Level />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
