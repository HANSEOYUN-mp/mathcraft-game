import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VirtualKeyboard from './VirtualKeyboard.jsx';
import ResultModal from './ResultModal.jsx';
import { KEY_PRACTICE_DATA } from './typingData.js';
import { KEY_MAP } from './koreanUtils.js';
import { sound } from './soundEffects.js';

function KeyPractice({ language, onBack, addTrophy, triggerConfetti }) {
  const practiceSets = KEY_PRACTICE_DATA[language];
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);

  const currentSet = practiceSets[selectedSetIndex];
  const TOTAL_TARGET_KEYS = 25;

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeKey, setActiveKey] = useState('');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const inputRef = useRef(null);

  // 큐 생성
  const initializeQueue = () => {
    const keys = currentSet.keys;
    const newQueue = [];
    for (let i = 0; i < TOTAL_TARGET_KEYS; i++) {
      const randomIndex = Math.floor(Math.random() * keys.length);
      newQueue.push(keys[randomIndex]);
    }
    setQueue(newQueue);
    setCurrentIndex(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setErrorCount(0);
    setStartTime(null);
    setIsFinished(false);
    setElapsedSeconds(0);
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    initializeQueue();
  }, [selectedSetIndex, language]);

  // 경과 시간 타이머
  useEffect(() => {
    if (!startTime || isFinished) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isFinished]);

  const targetChar = queue[currentIndex] || '';

  // 키 입력 판별 함수
  const checkInput = (inputChar, physicalKey = '') => {
    if (isFinished || !targetChar) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    let isMatch = false;

    if (language === 'ko') {
      // 1. 직접 한글 낱자 일치 여부
      if (inputChar === targetChar) {
        isMatch = true;
      }
      // 2. 키보드 매핑을 통한 영문 키 일치 여부
      const mappedEngKey = KEY_MAP[targetChar];
      if (mappedEngKey && physicalKey) {
        if (mappedEngKey.toLowerCase() === physicalKey.toLowerCase()) {
          // 쌍자음 확인
          const isShiftTarget = mappedEngKey === mappedEngKey.toUpperCase() && mappedEngKey !== mappedEngKey.toLowerCase();
          const isShiftInput = physicalKey === physicalKey.toUpperCase() && physicalKey !== physicalKey.toLowerCase();
          if (!isShiftTarget || isShiftInput) {
            isMatch = true;
          }
        }
      }
    } else {
      // 영어 대소문자 일치 여부
      if (inputChar.toLowerCase() === targetChar.toLowerCase() || physicalKey.toLowerCase() === targetChar.toLowerCase()) {
        isMatch = true;
      }
    }

    setActiveKey(physicalKey || inputChar);
    setTimeout(() => setActiveKey(''), 120);

    if (isMatch) {
      sound.playKey();
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setCorrectCount(prev => prev + 1);

      if (currentIndex + 1 >= TOTAL_TARGET_KEYS) {
        // 종료
        sound.playComplete();
        setIsFinished(true);
        triggerConfetti();
        addTrophy(1);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } else {
      sound.playError();
      setCombo(0);
      setErrorCount(prev => prev + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' || e.key === 'Escape') return;
    
    // 특수 기능 키 제외
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
      return;
    }

    // Space 처리
    if (e.key === ' ' && targetChar === ' ') {
      e.preventDefault();
      checkInput(' ', ' ');
      return;
    }

    // 영문 입력 직접 매칭 또는 키 검사
    if (e.key.length === 1) {
      checkInput(e.key, e.key);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const lastChar = val[val.length - 1];
    checkInput(lastChar, '');
    e.target.value = '';
  };

  const toggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  // 통계 계산
  const totalAttempts = correctCount + errorCount;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;
  const cpm = elapsedSeconds > 0 ? Math.round((correctCount / (elapsedSeconds / 60))) : Math.round(correctCount * 30);

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-between p-3 max-w-5xl mx-auto w-full select-none"
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      {/* 화면 밖 숨김 인풋 (모바일 및 한글 IME 안정적 캡처용) */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -top-96"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      {/* 헤더 및 컨트롤 바 */}
      <div className="w-full flex justify-between items-center bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all text-slate-300"
        >
          ⬅️ 목록으로
        </button>

        {/* 자리 세트 선택 탭 */}
        <div className="flex gap-1.5 overflow-x-auto max-w-lg py-1">
          {practiceSets.map((set, idx) => (
            <button
              key={set.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSetIndex(idx);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSetIndex === idx
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {set.name}
            </button>
          ))}
        </div>

        {/* 사운드 토글 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSound();
          }}
          className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 transition-all"
        >
          {soundEnabled ? '🔊 효과음' : '🔇 음소거'}
        </button>
      </div>

      {/* 상태 표시 대시보드 */}
      <div className="w-full grid grid-cols-4 gap-2 my-2">
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">진행률</span>
          <div className="text-lg font-black text-indigo-400">
            {currentIndex} / {TOTAL_TARGET_KEYS}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">콤보 (Combo)</span>
          <div className="text-lg font-black text-amber-400">
            {combo}🔥
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">정확도</span>
          <div className="text-lg font-black text-emerald-400">
            {accuracy}%
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">속도 (CPM)</span>
          <div className="text-lg font-black text-cyan-400">
            {cpm}
          </div>
        </div>
      </div>

      {/* 메인 낱자 디스플레이 카드 */}
      <div className="my-auto flex flex-col items-center justify-center">
        {/* 다가오는 글자 큐 프리뷰 */}
        <div className="flex gap-2 items-center mb-3">
          {queue.slice(currentIndex, currentIndex + 5).map((ch, idx) => (
            <div
              key={idx}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                idx === 0
                  ? 'bg-yellow-400 text-slate-950 font-black scale-110 shadow-lg shadow-yellow-400/40'
                  : 'bg-slate-800/60 text-slate-400 border border-white/10'
              }`}
            >
              {ch}
            </div>
          ))}
        </div>

        {/* 현재 쳐야 할 글자 초대형 디스플레이 */}
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="relative w-44 h-44 sm:w-52 sm:h-52 bg-gradient-to-b from-indigo-950/80 to-slate-900/90 border-2 border-indigo-400/40 rounded-3xl flex flex-col items-center justify-center shadow-2xl backdrop-blur-md"
        >
          <div className="absolute top-2.5 text-[11px] font-bold text-indigo-300">
            키보드를 눌러보세요!
          </div>
          <span className="text-7xl sm:text-8xl font-black text-yellow-300 drop-shadow-md">
            {targetChar}
          </span>
          <div className="absolute bottom-2.5 text-xs text-slate-400 font-bold">
            {language === 'ko' ? `영문 글쇠: [ ${(KEY_MAP[targetChar] || '').toUpperCase()} ]` : `글쇠: [ ${targetChar.toUpperCase()} ]`}
          </div>
        </motion.div>
      </div>

      {/* 가상 키보드 가이드 */}
      <div className="w-full mt-2">
        <VirtualKeyboard
          targetChar={targetChar}
          activeKey={activeKey}
          language={language}
          showFingers={true}
        />
      </div>

      {/* 결과 모달 */}
      {isFinished && (
        <ResultModal
          stats={{
            cpm,
            maxCpm: cpm,
            accuracy,
            elapsedTime: elapsedSeconds,
            earnedStars: accuracy >= 90 ? 2 : 1,
            modeName: `기초 자리 연습 (${currentSet.name})`
          }}
          onRestart={initializeQueue}
          onExit={onBack}
        />
      )}
    </div>
  );
}

export default KeyPractice;
