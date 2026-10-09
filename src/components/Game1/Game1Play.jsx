import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Synthesizer Audio Manager inside React ---
const playSynthSound = (type, pitchIndex = 0) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'count') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const baseFreq = 523.25; // C5
      const freqFactor = Math.pow(1.059, (pitchIndex % 12));
      osc.frequency.setValueAtTime(baseFreq * freqFactor, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'correct') {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } else if (type === 'wrong') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(130, now);
      osc2.frequency.setValueAtTime(135, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc1.start();
      osc2.start();
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    }
  } catch (e) {
    console.error("Audio Web Synth failed:", e);
  }
};

const THEME_CONFIG = {
  poker: {
    name: '카드 마술사',
    avatar: '🎩',
    avatarWin: '🎩✨',
    avatarWrong: '🎩💥',
    hintText: '카드 덱을 누르면 카드들이 낱장으로 펼쳐져서 세어볼 수 있어!',
    textTemplate: '이번엔 {bundle}개씩 {bundles}묶음과 낱장 {singles}장이 있네! 총 카드는 몇 장일까?'
  },
  minecraft: {
    name: '블록 광부',
    avatar: '/images/person.png',
    avatarWin: '/images/person.png',
    avatarWrong: '/images/person.png',
    hintText: '상자를 터치해서 열면 보석이 깔끔하게 정렬돼!',
    textTemplate: '{bundle}개들이 상자 {bundles}개랑 낱개 보석 {singles}개가 필요해. 모두 몇 칸을 채울 수 있을까?'
  },
  baduk: {
    name: '바둑 신선',
    avatar: '👴',
    avatarWin: '👴👍',
    avatarWrong: '👴❓',
    hintText: '바둑통을 누르면 바둑돌들이 정렬되어 밖으로 나온단다.',
    textTemplate: '바둑돌 {bundle}개씩 {bundles}통과 낱개 {singles}알이 놓여 있구나. 바둑돌은 총 몇 알이더냐?'
  }
};

function Game1Play({
  onBack,
  addTrophy,
  triggerConfetti,
  score,
  setScore,
  bundleSize,
  maxRangeLimit,
  theme,
  isChallengeMode
}) {
  const [currentBundleSize, setCurrentBundleSize] = useState(bundleSize);
  const [bundles, setBundles] = useState(3);
  const [singles, setSingles] = useState(4);
  const [isOpened, setIsOpened] = useState([]);
  const [clickedSingles, setClickedSingles] = useState([]);
  const [choices, setChoices] = useState([]);
  const [stageProgress, setStageProgress] = useState(0);
  const [feedback, setFeedback] = useState('none'); // 'none' | 'correct' | 'wrong'
  const [localCombo, setLocalCombo] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const activeTheme = THEME_CONFIG[theme] || THEME_CONFIG.poker;

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const generateNewQuestion = () => {
    setFeedback('none');
    setSelectedChoice(null);
    setClickedSingles([]);

    const actualBundle = isChallengeMode 
      ? [2, 5, 10, 16][Math.floor(Math.random() * 4)] 
      : bundleSize;
    setCurrentBundleSize(actualBundle);

    // Limit calculation to stay within maxRangeLimit
    let maxBundles = Math.floor(maxRangeLimit / actualBundle);
    if (maxBundles < 1) maxBundles = 1;
    if (maxBundles > 5) maxBundles = 5;

    const bundleCount = Math.floor(Math.random() * maxBundles) + 1; // 1 ~ max
    const singleCount = Math.floor(Math.random() * actualBundle); // 0 ~ bundle-1

    const answer = actualBundle * bundleCount + singleCount;

    setBundles(bundleCount);
    setSingles(singleCount);
    setIsOpened(Array(bundleCount).fill(false));

    // Generate candidates
    const candidates = [answer];
    while (candidates.length < 3) {
      const offset = [-2, -1, 1, 2, -actualBundle, actualBundle][Math.floor(Math.random() * 6)];
      const wrong = answer + offset;
      if (wrong >= 1 && wrong <= maxRangeLimit && !candidates.includes(wrong)) {
        candidates.push(wrong);
      }
    }
    candidates.sort(() => Math.random() - 0.5);
    setChoices(candidates);
  };

  const handleToggleBundle = (idx) => {
    if (feedback !== 'none') return;
    playSynthSound('click');
    setIsOpened(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleSingleClick = (idx) => {
    if (feedback !== 'none') return;
    
    setClickedSingles(prev => {
      let next;
      if (prev.includes(idx)) {
        next = prev.filter(i => i !== idx);
      } else {
        next = [...prev, idx];
        playSynthSound('count', next.length);
      }
      return next;
    });
  };

  const handleChoiceClick = (choice) => {
    if (feedback !== 'none') return;
    setSelectedChoice(choice);
    
    const correctAnswer = currentBundleSize * bundles + singles;
    if (choice === correctAnswer) {
      // Correct!
      playSynthSound('correct');
      setFeedback('correct');
      setLocalCombo(prev => prev + 1);
      setScore(prev => prev + 20);
      triggerConfetti();

      // Progress check
      const nextProgress = stageProgress + 1;
      setStageProgress(nextProgress);

      setTimeout(() => {
        if (nextProgress >= 5) {
          // Clear stage
          addTrophy(1);
          setStageProgress(0);
          // Show victory alert
        }
        generateNewQuestion();
      }, 1500);

    } else {
      // Wrong!
      playSynthSound('wrong');
      setFeedback('wrong');
      setLocalCombo(0);
      
      setTimeout(() => {
        setFeedback('none');
        setSelectedChoice(null);
      }, 1500);
    }
  };

  const getProblemText = () => {
    let template = activeTheme.textTemplate;
    return template
      .replace('{bundle}', currentBundleSize)
      .replace('{bundles}', bundles)
      .replace('{singles}', singles);
  };

  const renderBundleGraphic = (opened, idx) => {
    const isThemePoker = theme === 'poker';
    const isThemeMinecraft = theme === 'minecraft';

    return (
      <div key={idx} className="relative w-16 h-16 flex items-center justify-center">
        {opened ? (
          <motion.div 
            layoutId={`bundle-card-${idx}`}
            onClick={() => handleToggleBundle(idx)}
            className="absolute z-20 w-28 h-28 bg-slate-900 border-2 border-indigo-400 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-2xl cursor-pointer"
          >
            {/* 5-column grid inside */}
            <div className="grid grid-cols-5 gap-1.5 w-full h-full items-center justify-items-center">
              {Array.from({ length: currentBundleSize }).map((_, i) => (
                <div key={i} className="w-4 h-4 flex items-center justify-center">
                  {isThemePoker ? (
                    <img src="/images/card_single.png" alt="card" className="w-full h-full object-contain" />
                  ) : isThemeMinecraft ? (
                    <img src="/images/bosuk.png" alt="gem" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 shadow-sm" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            layoutId={`bundle-card-${idx}`}
            onClick={() => handleToggleBundle(idx)}
            whileHover={{ scale: 1.08 }}
            className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400/30 rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-md overflow-hidden relative"
          >
            {isThemePoker ? (
              <img src="/images/card_deck.png" alt="cards" className="w-full h-full object-cover" />
            ) : isThemeMinecraft ? (
              <img src="/images/box.webp" alt="box" className="w-full h-full object-cover" />
            ) : (
              <>
                <span className="text-2xl">🟫</span>
                <span className="text-[10px] font-black text-yellow-300 leading-none mt-1">
                  {currentBundleSize}
                </span>
              </>
            )}
            {(isThemePoker || isThemeMinecraft) && (
              <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[8px] font-black text-yellow-300 leading-none">
                {currentBundleSize}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  const renderSingleGraphic = (idx) => {
    const isClicked = clickedSingles.includes(idx);
    const isThemePoker = theme === 'poker';
    const isThemeMinecraft = theme === 'minecraft';

    return (
      <motion.div
        key={idx}
        whileHover={{ scale: 1.1 }}
        onClick={() => handleSingleClick(idx)}
        className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg cursor-pointer shadow-sm relative transition-all ${
          isClicked 
            ? 'bg-indigo-600 border-indigo-400 scale-95 shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
            : 'bg-white border-slate-300 hover:bg-slate-100'
        }`}
      >
        <span className="filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)] flex items-center justify-center w-full h-full p-0.5">
          {isThemePoker ? (
            <img src="/images/card_single.png" alt="card" className="w-full h-full object-contain" />
          ) : isThemeMinecraft ? (
            <img src="/images/bosuk.png" alt="gem" className="w-full h-full object-contain" />
          ) : (
            '⚪'
          )}
        </span>
        {isClicked && (
          <span className="absolute top-[-3px] right-[-3px] text-[8px] bg-indigo-950 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold">
            {clickedSingles.indexOf(idx) + 1}
          </span>
        )}
      </motion.div>
    );
  };

  const renderAvatar = () => {
    const currentAvatar = feedback === 'correct' 
      ? activeTheme.avatarWin 
      : feedback === 'wrong' 
        ? activeTheme.avatarWrong 
        : activeTheme.avatar;

    if (typeof currentAvatar === 'string' && currentAvatar.startsWith('/images/')) {
      return (
        <img 
          src={currentAvatar} 
          alt="avatar" 
          className="w-12 h-12 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] animate-pulse" 
        />
      );
    }
    return (
      <div className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        {currentAvatar}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 max-w-5xl w-full mx-auto relative">
      {/* Header HUD */}
      <div className="w-full flex justify-between items-center mb-2.5 z-10">
        <button 
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 font-bold text-xs transition-all"
        >
          ⚙️ 처음으로
        </button>
        <div className="text-center">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">
            {isChallengeMode ? '🔥 챌린지 모드' : '📦 묶음 모험'}
          </span>
          <h3 className="text-lg font-black text-indigo-400">
            {activeTheme.name} 테마
          </h3>
        </div>
        <div className="flex gap-2 text-xs font-bold items-center">
          {localCombo > 0 && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-md animate-bounce text-[10px]">
              🔥 {localCombo} 콤보!
            </div>
          )}
          <div className="bg-slate-800 px-2.5 py-1.5 rounded-lg text-emerald-400">💯 점수: {score}</div>
        </div>
      </div>

      {/* Main Board Card */}
      <div className="w-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-10 flex flex-col gap-3.5">
        
        {/* Progress Dots */}
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < stageProgress 
                    ? 'bg-yellow-400 shadow-[0_0_6px_#f1c40f]' 
                    : 'bg-white/10 border border-white/5'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-400 text-[10px] font-nanum font-bold">진행도: {stageProgress}/5</span>
        </div>

        {/* Quest Dialog */}
        <div className="flex gap-3 items-start bg-white/5 border border-white/5 p-2.5 rounded-xl w-full">
          {renderAvatar()}
          <div className="flex-1 text-left flex flex-col gap-0.5">
            <span className="text-indigo-300 font-bold text-[10px] uppercase tracking-wider">문제 풀이 퀴즈</span>
            <p className="text-sm text-white leading-relaxed">
              {getProblemText()}
            </p>
          </div>
        </div>

        {/* Interactive Board Arena (Split Left & Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          
          {/* Left Box: Bundles (묶음 상자 5x5 배치) */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 flex flex-col items-center min-h-[240px] justify-center w-full">
            <span className="text-[10px] text-indigo-300 font-black tracking-wider uppercase mb-1.5">
              📦 묶음
            </span>
            <div className="w-full flex-1 overflow-y-auto max-h-[190px] pr-1 py-1 flex justify-center">
              <div className="grid grid-cols-5 gap-2.5 justify-items-center w-full max-w-[340px] my-auto">
                {Array.from({ length: 25 }).map((_, idx) => {
                  if (idx < bundles) {
                    const opened = isOpened[idx];
                    return renderBundleGraphic(opened, idx);
                  }
                  return (
                    <div 
                      key={`empty-bundle-${idx}`} 
                      className="w-16 h-16 border-2 border-dashed border-white/5 rounded-xl opacity-15"
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Box: Singles (낱개 아이템 5x5 배치) */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 flex flex-col items-center min-h-[240px] justify-center w-full">
            <span className="text-[10px] text-emerald-300 font-black tracking-wider uppercase mb-1.5">
              🍎 낱개
            </span>
            <div className="w-full flex-1 overflow-y-auto max-h-[190px] pr-1 py-1 flex justify-center">
              <div className="grid grid-cols-5 gap-2.5 justify-items-center w-full max-w-[260px] my-auto">
                {Array.from({ length: 25 }).map((_, idx) => {
                  if (idx < singles) {
                    return renderSingleGraphic(idx);
                  }
                  return (
                    <div 
                      key={`empty-single-${idx}`} 
                      className="w-10 h-10 border-2 border-dashed border-white/5 rounded-lg opacity-15"
                    />
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Choices Grid */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">정답은 몇 개일까요?</span>
          <div className="grid grid-cols-3 gap-3 w-full">
            {choices.map(choice => {
              const isCorrect = choice === (currentBundleSize * bundles + singles);
              const isThisSelected = selectedChoice === choice;
              
              return (
                <button
                  key={choice}
                  disabled={feedback !== 'none'}
                  onClick={() => handleChoiceClick(choice)}
                  className={`py-2.5 rounded-xl font-black text-2xl border shadow-md transition-all ${
                    feedback === 'none' 
                      ? 'bg-gradient-to-b from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 border-white/10 text-white'
                      : isThisSelected 
                        ? isCorrect 
                          ? 'bg-emerald-600 border-emerald-400 text-white' 
                          : 'bg-rose-600 border-rose-400 text-white'
                        : isCorrect 
                          ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300' 
                          : 'bg-white/5 border-transparent text-slate-500 opacity-40'
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Game1Play;
