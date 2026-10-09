import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VirtualKeyboard from './VirtualKeyboard.jsx';
import ResultModal from './ResultModal.jsx';
import { WORD_PRACTICE_DATA } from './typingData.js';
import { countKeystrokes, decomposeHangulChar } from './koreanUtils.js';
import { sound } from './soundEffects.js';

function WordPractice({ language, onBack, addTrophy, triggerConfetti }) {
  const TOTAL_WORDS = 15;
  const wordList = WORD_PRACTICE_DATA[language];

  const [words, setWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [activeKey, setActiveKey] = useState('');
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const inputRef = useRef(null);

  // 단어 셔플 생성
  const initializeWords = () => {
    const shuffled = [...wordList].sort(() => 0.5 - Math.random()).slice(0, TOTAL_WORDS);
    setWords(shuffled);
    setWordIndex(0);
    setInputText('');
    setTotalKeystrokes(0);
    setErrorCount(0);
    setStartTime(null);
    setIsFinished(false);
    setElapsedSeconds(0);
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    initializeWords();
  }, [language]);

  // 타이머
  useEffect(() => {
    if (!startTime || isFinished) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isFinished]);

  const currentWord = words[wordIndex] || '';

  // 현재 입력 중인 위치에서 다음에 눌러야 할 글쇠 찾기
  let nextExpectedChar = '';
  if (currentWord && inputText.length < currentWord.length) {
    const targetChar = currentWord[inputText.length];
    if (language === 'ko') {
      const dec = decomposeHangulChar(targetChar);
      nextExpectedChar = dec ? dec.cho : targetChar;
    } else {
      nextExpectedChar = targetChar;
    }
  }

  const handleKeyDown = (e) => {
    if (isFinished) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    if (e.key === 'Backspace') {
      sound.playKey();
      return;
    }

    setActiveKey(e.key);
    setTimeout(() => setActiveKey(''), 100);

    // 스페이스 또는 엔터 누르면 단어 채점 후 넘어가기
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      checkAndSubmitWord();
      return;
    }

    sound.playKey();
  };

  const handleInputChange = (e) => {
    if (isFinished) return;
    const val = e.target.value;
    setInputText(val);

    // 단어가 완전히 똑같이 완성된 경우 바로 다음 단어로 이동
    if (val === currentWord) {
      checkAndSubmitWord(val);
    }
  };

  const checkAndSubmitWord = (forcedVal) => {
    const val = forcedVal !== undefined ? forcedVal : inputText;
    if (!val.trim()) return;

    // 타수 누적
    const strokes = countKeystrokes(val);
    setTotalKeystrokes(prev => prev + strokes);

    if (val === currentWord) {
      sound.playSuccess();
    } else {
      sound.playError();
      setErrorCount(prev => prev + 1);
    }

    if (wordIndex + 1 >= words.length) {
      // 연습 종료
      sound.playComplete();
      setIsFinished(true);
      triggerConfetti();
      addTrophy(2);
    } else {
      setWordIndex(prev => prev + 1);
      setInputText('');
    }
  };

  const toggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  // 통계
  const accuracy = Math.max(0, Math.round(((TOTAL_WORDS - errorCount) / TOTAL_WORDS) * 100));
  const cpm = elapsedSeconds > 0 ? Math.round((totalKeystrokes / (elapsedSeconds / 60))) : 0;

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-between p-3 max-w-5xl mx-auto w-full select-none"
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      {/* 헤더 및 컨트롤 바 */}
      <div className="w-full flex justify-between items-center bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all text-slate-300"
        >
          ⬅️ 목록으로
        </button>

        <div className="text-center">
          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            🌱 중급 단어 연습
          </span>
          <span className="text-[11px] text-slate-400 ml-2">
            ({language === 'ko' ? '한국어 단어' : 'English Words'})
          </span>
        </div>

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

      {/* 상태 대시보드 */}
      <div className="w-full grid grid-cols-4 gap-2 my-2">
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">진행 단어</span>
          <div className="text-lg font-black text-indigo-400">
            {wordIndex + 1} / {TOTAL_WORDS}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">타수 (CPM)</span>
          <div className="text-lg font-black text-cyan-400">
            {cpm} 타/분
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">정확도</span>
          <div className="text-lg font-black text-emerald-400">
            {accuracy}%
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">경과 시간</span>
          <div className="text-lg font-black text-amber-400">
            {elapsedSeconds}초
          </div>
        </div>
      </div>

      {/* 단어 연습 카드 */}
      <div className="my-auto flex flex-col items-center w-full max-w-xl">
        {/* 다음 단어들 미리보기 칩 */}
        <div className="flex gap-2 mb-3 overflow-x-auto max-w-full py-1">
          {words.slice(wordIndex, wordIndex + 5).map((w, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                idx === 0
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {w}
            </span>
          ))}
        </div>

        {/* 단어 표시 및 글자별 매칭 카드 */}
        <div className="w-full bg-slate-900/80 border-2 border-emerald-500/40 rounded-3xl p-6 flex flex-col items-center shadow-2xl backdrop-blur-md">
          {/* 목표 단어 글자 시각화 */}
          <div className="flex gap-2 items-center justify-center mb-5 tracking-widest">
            {currentWord.split('').map((char, idx) => {
              const inputChar = inputText[idx];
              let charStyle = 'text-white border-white/20';

              if (inputChar !== undefined) {
                if (inputChar === char) {
                  charStyle = 'text-emerald-400 border-emerald-500 bg-emerald-500/10 font-black';
                } else {
                  charStyle = 'text-rose-400 border-rose-500 bg-rose-500/10 font-black';
                }
              } else if (idx === inputText.length) {
                charStyle = 'text-yellow-300 border-yellow-400 bg-yellow-400/10 animate-pulse';
              }

              return (
                <div
                  key={idx}
                  className={`w-12 h-14 sm:w-16 sm:h-18 text-2xl sm:text-3xl rounded-2xl flex items-center justify-center border-2 ${charStyle}`}
                >
                  {char}
                </div>
              );
            })}
          </div>

          {/* 입력창 */}
          <div className="w-full relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="단어를 입력하고 Space 또는 Enter 키를 누르세요"
              className="w-full bg-black/40 border border-emerald-400/50 rounded-2xl px-5 py-3.5 text-center text-xl font-bold text-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30 transition-all font-nanum"
              autoFocus
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 단어를 완성하면 자동으로 넘어가거나 Space/Enter 키로 제출할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 가상 키보드 가이드 */}
      <div className="w-full mt-2">
        <VirtualKeyboard
          targetChar={nextExpectedChar}
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
            earnedStars: accuracy >= 90 ? 3 : 2,
            modeName: '중급 단어 연습'
          }}
          onRestart={initializeWords}
          onExit={onBack}
        />
      )}
    </div>
  );
}

export default WordPractice;
