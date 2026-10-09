import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Game1Play from './Game1Play.jsx';

function Game1Setup({ onBack, addTrophy, triggerConfetti, score, setScore, trophies }) {
  const [bundleSize, setBundleSize] = useState(10); // 2 | 5 | 10 | 16
  const [maxRangeLimit, setMaxRangeLimit] = useState(80); // 10 ~ 100
  const [theme, setTheme] = useState('poker'); // 'poker' | 'minecraft' | 'baduk'
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartGame = (challenge = false) => {
    setIsChallengeMode(challenge);
    setIsPlaying(true);
  };

  if (isPlaying) {
    return (
      <Game1Play
        onBack={() => setIsPlaying(false)}
        addTrophy={addTrophy}
        triggerConfetti={triggerConfetti}
        score={score}
        setScore={setScore}
        bundleSize={bundleSize}
        maxRangeLimit={maxRangeLimit}
        theme={theme}
        isChallengeMode={isChallengeMode}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 relative">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-4 z-10">
        <button 
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/10 font-bold text-xs transition-all"
        >
          🏠 로비로
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
            📦 묶음 조립 모험
          </h2>
          <span className="text-slate-400 text-xs">재미있게 묶음과 배수를 배워보자!</span>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-yellow-300">
          🏆 별: {trophies}개
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-3.5 z-10">
        
        {/* Left Settings Panel */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          
          {/* 1. Bundle Selection */}
          <div className="bg-slate-900/60 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-md">
            <h3 className="text-sm font-black text-indigo-300 mb-2">📦 1. 어떤 묶음으로 공부할래?</h3>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 16].map(size => (
                <button
                  key={size}
                  onClick={() => setBundleSize(size)}
                  className={`py-2 rounded-xl font-black text-base border transition-all ${
                    bundleSize === size 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {size}개씩
                </button>
              ))}
            </div>
          </div>

          {/* 2. Number Range Slider */}
          <div className="bg-slate-900/60 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-md">
            <h3 className="text-sm font-black text-indigo-300 mb-2">🔢 2. 숫자는 최대 몇 이하로 나오게 할까?</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMaxRangeLimit(prev => Math.max(10, prev - 10))}
                className="bg-white/10 hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-base"
              >
                -
              </button>
              <div className="flex-1 flex flex-col gap-1">
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="10" 
                  value={maxRangeLimit}
                  onChange={(e) => setMaxRangeLimit(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-bold px-1">
                  <span>10</span>
                  <span>30</span>
                  <span>50</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
              <button 
                onClick={() => setMaxRangeLimit(prev => Math.min(100, prev + 10))}
                className="bg-white/10 hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-base"
              >
                +
              </button>
              
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/5 text-center min-w-[70px]">
                <span className="text-xl font-black text-indigo-400">{maxRangeLimit}</span>
                <span className="text-slate-500 text-[10px] block leading-none">이하</span>
              </div>
            </div>
          </div>

          {/* 3. Theme Selection */}
          <div className="bg-slate-900/60 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-md">
            <h3 className="text-sm font-black text-indigo-300 mb-2">🎨 3. 어떤 디자인으로 공부할래?</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'poker', emoji: '🃏', name: '카드 마술' },
                { id: 'minecraft', emoji: '🟩', name: '광산 보석' },
                { id: 'baduk', emoji: '⚫', name: '바둑 신선' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`py-2 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all ${
                    theme === t.id 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">{t.emoji}</span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Start Normal Game Button */}
          <button 
            onClick={() => handleStartGame(false)}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black py-2.5 rounded-xl text-base shadow-md flex items-center justify-center gap-2 transition-all"
          >
            🏁 수련 시작! (선택한 묶음)
          </button>

        </div>

        {/* Right Challenge Column */}
        <div className="flex flex-col">
          <div 
            onClick={() => handleStartGame(true)}
            className="cursor-pointer flex-grow bg-gradient-to-b from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 border-2 border-orange-400/20 rounded-xl p-4 flex flex-col items-center text-center shadow-lg relative overflow-hidden group min-h-[220px] justify-between"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="text-4xl group-hover:animate-bounce mt-2">🔥</div>
            
            <div className="my-auto">
              <h3 className="text-xl font-black text-yellow-300 tracking-wider">Challenge!</h3>
              <p className="text-orange-100 text-[11px] mt-1.5 leading-relaxed font-nanum">
                2, 5, 10, 16 묶음이 골고루 섞여서 출제되는 하이브리드 끝판왕 모드! 실력을 테스트해보세요!
              </p>
            </div>

            <span className="w-full bg-orange-950/40 border border-orange-500/30 text-yellow-200 font-bold py-2 rounded-xl text-xs tracking-wide mt-3">
              도전 모드 시작 ➔
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Game1Setup;
