import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VirtualKeyboard from './VirtualKeyboard.jsx';
import ResultModal from './ResultModal.jsx';
import { SENTENCE_PRACTICE_DATA } from './typingData.js';
import { countKeystrokes, decomposeHangulChar } from './koreanUtils.js';
import { sound } from './soundEffects.js';

function SentencePractice({ language, onBack, addTrophy, triggerConfetti }) {
  const TOTAL_SENTENCES = 5;
  const sentencePool = SENTENCE_PRACTICE_DATA[language];

  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [activeKey, setActiveKey] = useState('');
  const [sentenceStartTime, setSentenceStartTime] = useState(null);
  const [currentCpm, setCurrentCpm] = useState(0);
  const [maxCpm, setMaxCpm] = useState(0);
  const [totalCompletedKeystrokes, setTotalCompletedKeystrokes] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalTargetChars, setTotalTargetChars] = useState(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const inputRef = useRef(null);

  const initializeSentences = () => {
    const shuffled = [...sentencePool].sort(() => 0.5 - Math.random()).slice(0, TOTAL_SENTENCES);
    setSentences(shuffled);
    setCurrentIndex(0);
    setInputText('');
    setSentenceStartTime(null);
    setCurrentCpm(0);
    setMaxCpm(0);
    setTotalCompletedKeystrokes(0);
    setTotalErrors(0);
    setTotalTargetChars(0);
    setTotalElapsedSeconds(0);
    setIsFinished(false);
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    initializeSentences();
  }, [language]);

  // 실시간 타이머 및 CPM 계산
  useEffect(() => {
    if (!sentenceStartTime || isFinished) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedTotalSec = Math.max(1, Math.floor((now - sentenceStartTime) / 1000));
      setTotalElapsedSeconds(elapsedTotalSec);

      // 현재 문장 입력 타수
      const currentStrokes = countKeystrokes(inputText);
      const totalStrokes = totalCompletedKeystrokes + currentStrokes;
      const calculatedCpm = Math.round((totalStrokes / (elapsedTotalSec / 60)));
      setCurrentCpm(calculatedCpm);
      if (calculatedCpm > maxCpm && calculatedCpm < 1500) {
        setMaxCpm(calculatedCpm);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [sentenceStartTime, isFinished, inputText, totalCompletedKeystrokes, maxCpm]);

  const targetSentence = sentences[currentIndex] || '';

  // 다음에 쳐야 할 글쇠 찾기
  let nextExpectedChar = '';
  if (targetSentence && inputText.length < targetSentence.length) {
    const targetChar = targetSentence[inputText.length];
    if (language === 'ko') {
      const dec = decomposeHangulChar(targetChar);
      nextExpectedChar = dec ? dec.cho : targetChar;
    } else {
      nextExpectedChar = targetChar;
    }
  }

  const handleKeyDown = (e) => {
    if (isFinished) return;

    if (!sentenceStartTime) {
      setSentenceStartTime(Date.now());
    }

    setActiveKey(e.key);
    setTimeout(() => setActiveKey(''), 100);

    if (e.key === 'Backspace') {
      sound.playKey();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitSentence();
      return;
    }

    sound.playKey();
  };

  const handleInputChange = (e) => {
    if (isFinished) return;
    const val = e.target.value;
    setInputText(val);

    // 문장의 끝까지 입력 완료된 경우 자동 제출
    if (val.length >= targetSentence.length && val === targetSentence) {
      handleSubmitSentence(val);
    }
  };

  const handleSubmitSentence = (forcedVal) => {
    const val = forcedVal !== undefined ? forcedVal : inputText;
    if (!val.trim()) return;

    // 현재 문장의 오타 수 계산
    let sentenceErrors = 0;
    for (let i = 0; i < targetSentence.length; i++) {
      if (val[i] !== targetSentence[i]) {
        sentenceErrors++;
      }
    }

    const strokes = countKeystrokes(val);
    setTotalCompletedKeystrokes(prev => prev + strokes);
    setTotalErrors(prev => prev + sentenceErrors);
    setTotalTargetChars(prev => prev + targetSentence.length);

    if (sentenceErrors === 0) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    if (currentIndex + 1 >= sentences.length) {
      sound.playComplete();
      setIsFinished(true);
      triggerConfetti();
      addTrophy(3);
    } else {
      setCurrentIndex(prev => prev + 1);
      setInputText('');
    }
  };

  const toggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  // 정확도 계산
  const currentCharsCompared = inputText.length;
  let currentSentenceErrors = 0;
  for (let i = 0; i < currentCharsCompared; i++) {
    if (inputText[i] !== targetSentence[i]) {
      currentSentenceErrors++;
    }
  }

  const allCompared = totalTargetChars + currentCharsCompared;
  const allErrors = totalErrors + currentSentenceErrors;
  const accuracy = allCompared > 0 ? Math.max(0, Math.round(((allCompared - allErrors) / allCompared) * 100)) : 100;

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-between p-3 max-w-5xl mx-auto w-full select-none"
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      {/* 헤더 및 상단 컨트롤 */}
      <div className="w-full flex justify-between items-center bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all text-slate-300"
        >
          ⬅️ 목록으로
        </button>

        <div className="text-center">
          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            🔥 상급 문장 연습
          </span>
          <span className="text-[11px] text-slate-400 ml-2">
            ({language === 'ko' ? '한국어 속담/명언' : 'English Quotes'})
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
          <span className="text-[10px] text-slate-400">진행 문장</span>
          <div className="text-lg font-black text-indigo-400">
            {currentIndex + 1} / {TOTAL_SENTENCES}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">현재 타수 (CPM)</span>
          <div className="text-lg font-black text-cyan-400">
            {currentCpm} 타/분
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">최고 타수</span>
          <div className="text-lg font-black text-amber-400">
            {maxCpm} 타/분
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2 text-center">
          <span className="text-[10px] text-slate-400">정확도</span>
          <div className="text-lg font-black text-emerald-400">
            {accuracy}%
          </div>
        </div>
      </div>

      {/* 문장 연습 메인 영역 (한컴타자연습 스타일) */}
      <div className="my-auto flex flex-col items-center w-full max-w-3xl">
        <div className="w-full bg-slate-900/85 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-2xl backdrop-blur-md">
          {/* 상단 목표 문장 렌더링 (글자별 대조) */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 text-xl sm:text-2xl font-nanum font-bold leading-relaxed tracking-wide min-h-[70px] flex flex-wrap items-center">
            {targetSentence.split('').map((char, idx) => {
              const inputChar = inputText[idx];
              let textColor = 'text-slate-400';
              let underline = '';

              if (inputChar !== undefined) {
                if (inputChar === char) {
                  textColor = 'text-emerald-400';
                } else {
                  textColor = 'text-rose-400 bg-rose-500/20 rounded';
                  underline = 'underline decoration-rose-500 decoration-2';
                }
              } else if (idx === inputText.length) {
                textColor = 'text-yellow-300 font-black';
                underline = 'border-b-2 border-yellow-400 animate-pulse';
              }

              return (
                <span key={idx} className={`${textColor} ${underline} transition-colors duration-75`}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>

          {/* 하단 사용자 입력창 */}
          <div className="w-full relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="위 문장을 똑같이 입력하고 Enter 키를 누르세요"
              className="w-full bg-black/50 border-2 border-purple-400/50 rounded-2xl px-5 py-4 text-xl sm:text-2xl font-bold text-white focus:outline-none focus:ring-4 focus:ring-purple-400/30 transition-all font-nanum"
              autoFocus
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 px-1">
            <span>💡 문장 입력 후 [Enter]를 누르면 다음 문장으로 넘어갑니다.</span>
            <span>글자 수: {inputText.length} / {targetSentence.length}</span>
          </div>
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
            cpm: currentCpm,
            maxCpm,
            accuracy,
            elapsedTime: totalElapsedSeconds,
            earnedStars: accuracy >= 90 ? 4 : 2,
            modeName: '상급 문장 연습'
          }}
          onRestart={initializeSentences}
          onExit={onBack}
        />
      )}
    </div>
  );
}

export default SentencePractice;
