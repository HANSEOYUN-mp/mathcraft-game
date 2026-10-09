import React, { useState } from 'react';
import { motion } from 'framer-motion';
import KeyPractice from './KeyPractice.jsx';
import WordPractice from './WordPractice.jsx';
import SentencePractice from './SentencePractice.jsx';

function Game3Setup({ onBack, addTrophy, triggerConfetti, score, setScore, trophies }) {
  const [activeMode, setActiveMode] = useState(null); // null | 'key' | 'word' | 'sentence'
  const [language, setLanguage] = useState('ko'); // 'ko' | 'en'

  const handleBackToSetup = () => {
    setActiveMode(null);
  };

  if (activeMode === 'key') {
    return (
      <KeyPractice
        language={language}
        onBack={handleBackToSetup}
        addTrophy={addTrophy}
        triggerConfetti={triggerConfetti}
      />
    );
  }

  if (activeMode === 'word') {
    return (
      <WordPractice
        language={language}
        onBack={handleBackToSetup}
        addTrophy={addTrophy}
        triggerConfetti={triggerConfetti}
      />
    );
  }

  if (activeMode === 'sentence') {
    return (
      <SentencePractice
        language={language}
        onBack={handleBackToSetup}
        addTrophy={addTrophy}
        triggerConfetti={triggerConfetti}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
      {/* 헤더 */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-5 z-10">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/10 font-bold text-sm transition-all"
        >
          🏠 로비로
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            ⌨️ 타자 마스터 모험
          </h2>
          <span className="text-slate-400 text-xs">한글과 영어로 타자 실력을 키워보자!</span>
        </div>

        <div className="bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-yellow-300">
          🏆 별: {trophies}개
        </div>
      </div>

      {/* 언어 선택 탭 바 */}
      <div className="w-full max-w-5xl flex justify-center mb-6 z-10">
        <div className="bg-slate-900/80 border border-white/10 p-1 rounded-2xl flex gap-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setLanguage('ko')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
              language === 'ko'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🇰🇷</span>
            <span>한국어 (한글)</span>
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
              language === 'en'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🇺🇸</span>
            <span>English (영어)</span>
          </button>
        </div>
      </div>

      {/* 난이도별 모드 카드 그리드 */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 z-10">
        
        {/* 1. 기초 - 자리 연습 */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveMode('key')}
          className="cursor-pointer bg-white/5 hover:bg-white/10 border-2 border-emerald-500/30 hover:border-emerald-400 rounded-3xl p-5 flex flex-col items-center text-center transition-all group min-h-[240px] justify-between shadow-xl backdrop-blur-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            🎯
          </div>
          <div>
            <span className="inline-block bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] mb-2">
              LEVEL 1 · 기초
            </span>
            <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
              글쇠 자리 연습
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed font-nanum">
              키보드를 보지 않고 칠 수 있도록 기본 자리부터 하나씩 올바른 손가락 위치로 차근차근 익혀요!
            </p>
          </div>
          <span className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-black shadow-md shadow-emerald-500/30">
            자리 연습 시작 ➔
          </span>
        </motion.div>

        {/* 2. 중급 - 단어 연습 */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveMode('word')}
          className="cursor-pointer bg-white/5 hover:bg-white/10 border-2 border-cyan-500/30 hover:border-cyan-400 rounded-3xl p-5 flex flex-col items-center text-center transition-all group min-h-[240px] justify-between shadow-xl backdrop-blur-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            🌿
          </div>
          <div>
            <span className="inline-block bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] mb-2">
              LEVEL 2 · 중급
            </span>
            <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">
              낱말 단어 연습
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed font-nanum">
              일상 단어, 동물, 자연 등 재미있는 단어들을 리듬감 있게 치며 정확도와 타자 속도를 높여요!
            </p>
          </div>
          <span className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-xl text-xs font-black shadow-md shadow-cyan-500/30">
            단어 연습 시작 ➔
          </span>
        </motion.div>

        {/* 3. 상급 - 문장 연습 */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveMode('sentence')}
          className="cursor-pointer bg-white/5 hover:bg-white/10 border-2 border-purple-500/30 hover:border-purple-400 rounded-3xl p-5 flex flex-col items-center text-center transition-all group min-h-[240px] justify-between shadow-xl backdrop-blur-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            🚀
          </div>
          <div>
            <span className="inline-block bg-purple-500/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] mb-2">
              LEVEL 3 · 상급
            </span>
            <h3 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors">
              속담 명언 문장 연습
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed font-nanum">
              유명한 속담과 명언 문장을 실시간 타수(CPM)와 정확도를 확인하며 한컴타자 스타일로 정복해요!
            </p>
          </div>
          <span className="mt-3 w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-xl text-xs font-black shadow-md shadow-purple-500/30">
            문장 연습 시작 ➔
          </span>
        </motion.div>

      </div>
    </div>
  );
}

export default Game3Setup;
