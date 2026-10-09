import React, { useState, useEffect } from 'react';
import Lobby from './components/Lobby.jsx';
import Game1 from './components/Game1/Game1Setup.jsx';
import Game2 from './components/Game2/Game2Setup.jsx';
import Game3 from './components/Game3/Game3Setup.jsx';
import Confetti from './components/Confetti.jsx';

function App() {
  const [currentView, setCurrentView] = useState('lobby');
  const [score, setScore] = useState(0);
  const [trophies, setTrophies] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mathcraft_g2_trophies') || '0';
    setTrophies(parseInt(saved, 10));
  }, []);

  const addTrophy = (count = 1) => {
    const newTrophies = trophies + count;
    setTrophies(newTrophies);
    localStorage.setItem('mathcraft_g2_trophies', newTrophies.toString());
  };

  const triggerConfetti = () => {
    setConfettiActive(false);
    setTimeout(() => {
      setConfettiActive(true);
    }, 10);
  };

  useEffect(() => {
    if (confettiActive) {
      const timer = setTimeout(() => {
        setConfettiActive(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [confettiActive]);

  return (
    <div 
      style={{ backgroundImage: "url('/images/background_ref_1.jpg')" }}
      className="min-h-screen w-full bg-slate-950 bg-cover bg-center bg-no-repeat text-white flex flex-col font-jua select-none relative overflow-hidden"
    >
      {/* Confetti canvas */}
      <Confetti active={confettiActive} />

      {/* Main Views */}
      {currentView === 'lobby' && (
        <Lobby 
          setCurrentView={setCurrentView} 
          trophies={trophies} 
          score={score} 
        />
      )}

      {currentView === 'game1' && (
        <Game1 
          onBack={() => setCurrentView('lobby')} 
          addTrophy={addTrophy}
          triggerConfetti={triggerConfetti}
          score={score}
          setScore={setScore}
          trophies={trophies}
        />
      )}

      {currentView === 'game2' && (
        <Game2 
          onBack={() => setCurrentView('lobby')} 
          addTrophy={addTrophy}
          triggerConfetti={triggerConfetti}
          score={score}
          setScore={setScore}
          trophies={trophies}
        />
      )}

      {currentView === 'game3' && (
        <Game3 
          onBack={() => setCurrentView('lobby')} 
          addTrophy={addTrophy}
          triggerConfetti={triggerConfetti}
          score={score}
          setScore={setScore}
          trophies={trophies}
        />
      )}
    </div>
  );
}

export default App;
