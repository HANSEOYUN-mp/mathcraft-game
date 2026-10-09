// 한글 분해 및 타수 계산 유틸리티

// 유니코드 초성, 중성, 종성 테이블
const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 복합 자모 타수 가중치 (쌍자음이나 이중모음은 Shift 또는 2타)
const STROKE_COUNT_JUNGSUNG = {
  'ㅘ': 2, 'ㅙ': 2, 'ㅚ': 2, 'ㅝ': 2, 'ㅞ': 2, 'ㅟ': 2, 'ㅢ': 2
};

const STROKE_COUNT_JONGSUNG = {
  'ㄳ': 2, 'ㄵ': 2, 'ㄶ': 2, 'ㄺ': 2, 'ㄻ': 2, 'ㄼ': 2, 'ㄽ': 2, 'ㄾ': 2, 'ㄿ': 2, 'ㅀ': 2, 'ㅄ': 2
};

/**
 * 한글 문자 하나를 초성, 중성, 종성으로 분해
 */
export function decomposeHangulChar(ch) {
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const syllableIndex = code - 0xac00;
    const jong = syllableIndex % 28;
    const jung = ((syllableIndex - jong) / 28) % 21;
    const cho = Math.floor((syllableIndex - jong) / 28 / 21);
    return {
      cho: CHOSUNG[cho],
      jung: JUNGSUNG[jung],
      jong: JONGSUNG[jong] || null
    };
  }
  return null;
}

/**
 * 문자열 전체의 한글 타수(키 입력 횟수) 계산
 * 완성형 한글의 자모 개수 + 공백/특수문자/알파벳 타수를 종합 계산
 */
export function countKeystrokes(text) {
  if (!text) return 0;
  let strokes = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const decomposed = decomposeHangulChar(ch);
    if (decomposed) {
      // 초성 (1타, 쌍자음 1타/Shift)
      strokes += 1;
      // 중성
      strokes += STROKE_COUNT_JUNGSUNG[decomposed.jung] ? 2 : 1;
      // 종성
      if (decomposed.jong) {
        strokes += STROKE_COUNT_JONGSUNG[decomposed.jong] ? 2 : 1;
      }
    } else {
      // 영문 대문자 또는 Shift 기호는 1~2타, 기본 1타
      strokes += 1;
    }
  }
  return strokes;
}

/**
 * 영문/한글 자판 키 매핑 (키보드 하이라이트용)
 */
export const KEY_MAP = {
  // 한글 자음 -> 영문 키
  'ㄱ': 'r', 'ㄲ': 'R', 'ㄴ': 's', 'ㄷ': 'e', 'ㄸ': 'E', 'ㄹ': 'f',
  'ㅁ': 'a', 'ㅂ': 'q', 'ㅃ': 'Q', 'ㅅ': 't', 'ㅆ': 'T', 'ㅇ': 'd',
  'ㅈ': 'w', 'ㅉ': 'W', 'ㅊ': 'c', 'ㅋ': 'z', 'ㅌ': 'x', 'ㅍ': 'v', 'ㅎ': 'g',
  // 한글 모음 -> 영문 키
  'ㅏ': 'k', 'ㅐ': 'o', 'ㅑ': 'i', 'ㅒ': 'O', 'ㅓ': 'j', 'ㅔ': 'p',
  'ㅕ': 'u', 'ㅖ': 'P', 'ㅗ': 'h', 'ㅘ': 'h', 'ㅙ': 'h', 'ㅚ': 'h',
  'ㅛ': 'y', 'ㅜ': 'n', 'ㅝ': 'n', 'ㅞ': 'n', 'ㅟ': 'n', 'ㅠ': 'b',
  'ㅡ': 'm', 'ㅢ': 'm', 'ㅣ': 'l'
};

/**
 * 손가락 위치 매핑 (QWERTY 기준 손가락 가이드)
 * 0: 왼손 새끼, 1: 왼손 약지, 2: 왼손 중지, 3: 왼손 검지
 * 4: 오른손 검지, 5: 오른손 중지, 6: 오른손 약지, 7: 오른손 새끼
 * 8: 엄지 (Space)
 */
export const FINGER_MAP = {
  '1': 0, 'q': 0, 'a': 0, 'z': 0, '`': 0, '~': 0,
  '2': 1, 'w': 1, 's': 1, 'x': 1,
  '3': 2, 'e': 2, 'd': 2, 'c': 2,
  '4': 3, '5': 3, 'r': 3, 't': 3, 'f': 3, 'g': 3, 'v': 3, 'b': 3,
  '6': 4, '7': 4, 'y': 4, 'u': 4, 'h': 4, 'j': 4, 'n': 4, 'm': 4,
  '8': 5, 'i': 5, 'k': 5, ',': 5,
  '9': 6, 'o': 6, 'l': 6, '.': 6,
  '0': 7, '-': 7, '=': 7, 'p': 7, '[': 7, ']': 7, ';': 7, "'": 7, '/': 7,
  ' ': 8
};

export const FINGER_NAMES = [
  '왼손 새끼손가락',
  '왼손 약지',
  '왼손 중지',
  '왼손 검지',
  '오른손 검지',
  '오른손 중지',
  '오른손 약지',
  '오른손 새끼손가락',
  '엄지손가락 (스페이스)'
];
