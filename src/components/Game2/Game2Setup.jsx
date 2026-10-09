import React, { useState } from 'react';
import ElevatorMode from './ElevatorMode.jsx';
import TrainingMode from './TrainingMode.jsx';
import BattleMode from './BattleMode.jsx';

function Game2Setup({ onBack, addTrophy, triggerConfetti, score, setScore, trophies }) {
  const [activeMode, setActiveMode] = useState(null); // null | 'elevator' | 'training' | 'battle'

  const handleBackToSetup = () => {
    setActiveMode(null);
  };

  if (activeMode === 'elevator') {
    return (
      <ElevatorMode 
        onBack={handleBackToSetup} 
        addTrophy={addTrophy} 
        triggerConfetti={triggerConfetti} 
        score={score} 
        setScore={setScore} 
      />
    );
  }

  if (activeMode === 'training') {
    return (
      <TrainingMode 
        onBack={handleBackToSetup} 
        addTrophy={addTrophy} 
        triggerConfetti={triggerConfetti} 
        score={score} 
        setScore={setScore} 
      />
    );
  }

  if (activeMode === 'battle') {
    return (
      <BattleMode 
        onBack={handleBackToSetup} 
        addTrophy={addTrophy} 
        triggerConfetti={triggerConfetti} 
        score={score} 
        setScore={setScore} 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-5 z-10">
        <button 
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/10 font-bold text-sm transition-all"
        >
          🏠 로비로
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">
            🔮 숫자 마법사
          </h2>
          <span className="text-slate-400 text-xs">마법 학습 모드를 선택해봐!</span>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-yellow-300">
          🏆 별: {trophies}개
        </div>
      </div>

      {/* Mode Cards Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 z-10">
        
        {/* Elevator Mode */}
        <div 
          onClick={() => setActiveMode('elevator')}
          className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 flex flex-col items-center text-center transition-all group min-h-[220px] justify-between"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform duration-200">🛗</div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
              10층 숫자 엘리베이터
            </h3>
            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed font-nanum">
              10x10 수 배열표 위에서 🧙‍♂️ 마법사가 위아래로 움직이며 +10, -10, +9, -9 등 보수 계산의 지름길을 배워요!
            </p>
          </div>
          <span className="mt-3 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold">
            이동 학습 ➔
          </span>
        </div>

        {/* Training Mode */}
        <div 
          onClick={() => setActiveMode('training')}
          className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fuchsia-500/30 rounded-2xl p-4 flex flex-col items-center text-center transition-all group min-h-[220px] justify-between"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform duration-200">⚡</div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-fuchsia-400 transition-colors">
              마법사의 보수 트레이닝
            </h3>
            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed font-nanum">
              장난꾸러기 😈 몬스터의 성과 🧙‍♂️ 마법사 성의 대포 배틀! 10초 내에 보수 콤보 공식을 맞춰 대포를 쏴요!
            </p>
          </div>
          <span className="mt-3 bg-fuchsia-500/20 text-fuchsia-300 px-3 py-1 rounded-full text-xs font-bold">
            배틀 시작 ➔
          </span>
        </div>

        {/* Battle Mode */}
        <div 
          onClick={() => setActiveMode('battle')}
          className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-2xl p-4 flex flex-col items-center text-center transition-all group min-h-[220px] justify-between"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform duration-200">🛡️</div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">
              구십구 마법 장벽
            </h3>
            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed font-nanum">
              수치 카드를 써서 마법 장벽을 조절해요. 장벽 숫자가 0 미만이나 99를 넘지 않게 아슬아슬 버텨요!
            </p>
          </div>
          <span className="mt-3 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold">
            카드전 시작 ➔
          </span>
        </div>

      </div>
    </div>
  );
}

export default Game2Setup;
