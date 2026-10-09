import React from 'react';
import { KEY_MAP, FINGER_MAP, FINGER_NAMES } from './koreanUtils.js';

// 키보드 자판 레이아웃 정의 (4행)
const KEYBOARD_ROWS = [
  // 숫자 행
  [
    { code: 'Backquote', en: '`', shiftEn: '~', ko: '`', shiftKo: '~' },
    { code: 'Digit1', en: '1', shiftEn: '!', ko: '1', shiftKo: '!' },
    { code: 'Digit2', en: '2', shiftEn: '@', ko: '2', shiftKo: '@' },
    { code: 'Digit3', en: '3', shiftEn: '#', ko: '3', shiftKo: '#' },
    { code: 'Digit4', en: '4', shiftEn: '$', ko: '4', shiftKo: '$' },
    { code: 'Digit5', en: '5', shiftEn: '%', ko: '5', shiftKo: '%' },
    { code: 'Digit6', en: '6', shiftEn: '^', ko: '6', shiftKo: '^' },
    { code: 'Digit7', en: '7', shiftEn: '&', ko: '7', shiftKo: '&' },
    { code: 'Digit8', en: '8', shiftEn: '*', ko: '8', shiftKo: '*' },
    { code: 'Digit9', en: '9', shiftEn: '(', ko: '9', shiftKo: '(' },
    { code: 'Digit0', en: '0', shiftEn: ')', ko: '0', shiftKo: ')' },
    { code: 'Minus', en: '-', shiftEn: '_', ko: '-', shiftKo: '_' },
    { code: 'Equal', en: '=', shiftEn: '+', ko: '=', shiftKo: '+' },
  ],
  // QWERTY 행
  [
    { code: 'KeyQ', en: 'q', shiftEn: 'Q', ko: 'ㅂ', shiftKo: 'ㅃ' },
    { code: 'KeyW', en: 'w', shiftEn: 'W', ko: 'ㅈ', shiftKo: 'ㅉ' },
    { code: 'KeyE', en: 'e', shiftEn: 'E', ko: 'ㄷ', shiftKo: 'ㄸ' },
    { code: 'KeyR', en: 'r', shiftEn: 'R', ko: 'ㄱ', shiftKo: 'ㄲ' },
    { code: 'KeyT', en: 't', shiftEn: 'T', ko: 'ㅅ', shiftKo: 'ㅆ' },
    { code: 'KeyY', en: 'y', shiftEn: 'Y', ko: 'ㅛ', shiftKo: 'ㅛ' },
    { code: 'KeyU', en: 'u', shiftEn: 'U', ko: 'ㅕ', shiftKo: 'ㅕ' },
    { code: 'KeyI', en: 'i', shiftEn: 'I', ko: 'ㅑ', shiftKo: 'ㅑ' },
    { code: 'KeyO', en: 'o', shiftEn: 'O', ko: 'ㅐ', shiftKo: 'ㅒ' },
    { code: 'KeyP', en: 'p', shiftEn: 'P', ko: 'ㅔ', shiftKo: 'ㅖ' },
    { code: 'BracketLeft', en: '[', shiftEn: '{', ko: '[', shiftKo: '{' },
    { code: 'BracketRight', en: ']', shiftEn: '}', ko: ']', shiftKo: '}' },
  ],
  // ASDF 행
  [
    { code: 'KeyA', en: 'a', shiftEn: 'A', ko: 'ㅁ', shiftKo: 'ㅁ' },
    { code: 'KeyS', en: 's', shiftEn: 'S', ko: 'ㄴ', shiftKo: 'ㄴ' },
    { code: 'KeyD', en: 'd', shiftEn: 'D', ko: 'ㅇ', shiftKo: 'ㅇ' },
    { code: 'KeyF', en: 'f', shiftEn: 'F', ko: 'ㄹ', shiftKo: 'ㄹ' },
    { code: 'KeyG', en: 'g', shiftEn: 'G', ko: 'ㅎ', shiftKo: 'ㅎ' },
    { code: 'KeyH', en: 'h', shiftEn: 'H', ko: 'ㅗ', shiftKo: 'ㅗ' },
    { code: 'KeyJ', en: 'j', shiftEn: 'J', ko: 'ㅓ', shiftKo: 'ㅓ' },
    { code: 'KeyK', en: 'k', shiftEn: 'K', ko: 'ㅏ', shiftKo: 'ㅏ' },
    { code: 'KeyL', en: 'l', shiftEn: 'L', ko: 'ㅣ', shiftKo: 'ㅣ' },
    { code: 'Semicolon', en: ';', shiftEn: ':', ko: ';', shiftKo: ':' },
    { code: 'Quote', en: "'", shiftEn: '"', ko: "'", shiftKo: '"' },
  ],
  // ZXCV 행
  [
    { code: 'KeyZ', en: 'z', shiftEn: 'Z', ko: 'ㅋ', shiftKo: 'ㅋ' },
    { code: 'KeyX', en: 'x', shiftEn: 'X', ko: 'ㅌ', shiftKo: 'ㅌ' },
    { code: 'KeyC', en: 'c', shiftEn: 'C', ko: 'ㅊ', shiftKo: 'ㅊ' },
    { code: 'KeyV', en: 'v', shiftEn: 'V', ko: 'ㅍ', shiftKo: 'ㅍ' },
    { code: 'KeyB', en: 'b', shiftEn: 'B', ko: 'ㅠ', shiftKo: 'ㅠ' },
    { code: 'KeyN', en: 'n', shiftEn: 'N', ko: 'ㅜ', shiftKo: 'ㅜ' },
    { code: 'KeyM', en: 'm', shiftEn: 'M', ko: 'ㅡ', shiftKo: 'ㅡ' },
    { code: 'Comma', en: ',', shiftEn: '<', ko: ',', shiftKo: '<' },
    { code: 'Period', en: '.', shiftEn: '>', ko: '.', shiftKo: '>' },
    { code: 'Slash', en: '/', shiftEn: '?', ko: '/', shiftKo: '?' },
  ]
];

// 손가락별 색상 테두리/배경 지정
const FINGER_COLORS = [
  'border-pink-500/50 text-pink-300',      // 0: 왼손 새끼
  'border-orange-500/50 text-orange-300',  // 1: 왼손 약지
  'border-yellow-500/50 text-yellow-300',  // 2: 왼손 중지
  'border-emerald-500/50 text-emerald-300',// 3: 왼손 검지
  'border-teal-500/50 text-teal-300',      // 4: 오른손 검지
  'border-cyan-500/50 text-cyan-300',      // 5: 오른손 중지
  'border-blue-500/50 text-blue-300',      // 6: 오른손 약지
  'border-purple-500/50 text-purple-300',  // 7: 오른손 새끼
  'border-slate-500/50 text-slate-300',    // 8: 엄지
];

function VirtualKeyboard({ targetChar = '', activeKey = '', language = 'ko', showFingers = true }) {
  // targetChar를 정규화하여 매핑된 영문 키를 찾음
  let targetNormalized = targetChar;
  let isShiftNeeded = false;

  if (targetChar) {
    if (language === 'ko') {
      const mapped = KEY_MAP[targetChar];
      if (mapped) {
        targetNormalized = mapped.toLowerCase();
        isShiftNeeded = mapped === mapped.toUpperCase() && mapped !== mapped.toLowerCase();
      }
    } else {
      targetNormalized = targetChar.toLowerCase();
      if (targetChar !== ' ' && targetChar === targetChar.toUpperCase() && targetChar.match(/[A-Z]/)) {
        isShiftNeeded = true;
      }
    }
  }

  // 타겟 손가락 찾기
  const targetFingerIndex = targetChar === ' ' ? 8 : FINGER_MAP[targetNormalized];
  const targetFingerName = targetFingerIndex !== undefined ? FINGER_NAMES[targetFingerIndex] : '';

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl">
      {/* 손가락 가이드 배지 */}
      {showFingers && targetFingerName && (
        <div className="mb-2.5 flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs">
          <span className="text-yellow-400 font-bold">👉 손가락 가이드:</span>
          <span className="text-emerald-400 font-bold">{targetFingerName}</span>
          {isShiftNeeded && (
            <span className="ml-2 text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded text-[10px]">
              + Shift 키
            </span>
          )}
        </div>
      )}

      {/* 키보드 자판 행들 */}
      <div className="flex flex-col gap-1.5 w-full items-center">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5 justify-center w-full">
            {row.map((item) => {
              const charToMatch = item.en.toLowerCase();
              const isTarget = targetNormalized === charToMatch;
              const isCurrentActive = activeKey.toLowerCase() === charToMatch;
              const fingerIdx = FINGER_MAP[item.en.toLowerCase()];
              const fingerStyle = fingerIdx !== undefined ? FINGER_COLORS[fingerIdx] : 'border-white/10';

              return (
                <div
                  key={item.code}
                  className={`
                    relative flex flex-col items-center justify-center 
                    w-9 h-10 sm:w-11 sm:h-12 rounded-lg font-bold text-xs sm:text-sm select-none
                    transition-all duration-100 border
                    ${isTarget 
                      ? 'bg-yellow-400 text-slate-950 border-yellow-300 ring-4 ring-yellow-400/50 scale-105 z-10 shadow-lg shadow-yellow-500/50 animate-pulse' 
                      : isCurrentActive
                      ? 'bg-indigo-500 text-white scale-95 border-indigo-400'
                      : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700/80 ' + fingerStyle
                    }
                  `}
                >
                  {/* 주 표시 (한글 or 영어) */}
                  <span className="leading-tight text-xs sm:text-sm">
                    {language === 'ko' ? item.ko : item.en.toUpperCase()}
                  </span>
                  
                  {/* 보조 표시 (작게 표시) */}
                  <span className="text-[9px] text-slate-400 leading-none">
                    {language === 'ko' ? item.en.toUpperCase() : item.ko}
                  </span>

                  {/* F, J 키의 돌기(홈) 표시 */}
                  {(item.code === 'KeyF' || item.code === 'KeyJ') && (
                    <div className="absolute bottom-1 w-2.5 h-0.5 bg-slate-400/60 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Space Bar 행 */}
        <div className="flex gap-2 justify-center w-full mt-1">
          <div
            className={`
              h-9 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs
              transition-all duration-100 border
              ${targetChar === ' ' 
                ? 'w-64 sm:w-80 bg-yellow-400 text-slate-950 border-yellow-300 ring-4 ring-yellow-400/50 animate-pulse shadow-lg' 
                : activeKey === ' '
                ? 'w-64 sm:w-80 bg-indigo-500 text-white scale-95 border-indigo-400'
                : 'w-64 sm:w-80 bg-slate-800/90 text-slate-400 border-white/10 hover:bg-slate-700'
              }
            `}
          >
            Space Bar (공백)
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualKeyboard;
