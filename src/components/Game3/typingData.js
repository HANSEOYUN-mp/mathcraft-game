// 타자 연습용 텍스트 데이터셋 (기초/중급/상급, 한글/영어)

export const KEY_PRACTICE_DATA = {
  ko: [
    {
      id: 'ko-home',
      name: '기본 자리',
      description: '가장 중심이 되는 기본 글쇠 (ㅁ, ㄴ, ㅇ, ㄹ, ㅓ, ㅏ, ㅣ)',
      keys: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅓ', 'ㅏ', 'ㅣ', 'ㅎ']
    },
    {
      id: 'ko-top',
      name: '윗자리',
      description: '손가락을 위로 뻗어 누르는 글쇠 (ㅂ, ㅈ, ㄷ, ㄱ, ㅅ, ㅛ, ㅕ, ㅑ, ㅐ, ㅔ)',
      keys: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ']
    },
    {
      id: 'ko-bottom',
      name: '아랫자리',
      description: '손가락을 아래로 내려 누르는 글쇠 (ㅋ, ㅌ, ㅊ, ㅍ, ㅠ, ㅜ, ㅡ)',
      keys: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
    },
    {
      id: 'ko-shift',
      name: '쌍자음 자리',
      description: 'Shift 키를 함께 누르는 쌍자음 (ㄲ, ㄸ, ㅃ, ㅆ, ㅉ)',
      keys: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ', 'ㅒ', 'ㅖ']
    },
    {
      id: 'ko-all',
      name: '전체 자리 종합',
      description: '모든 자음과 모음을 골고루 연습하기',
      keys: [
        'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
        'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ'
      ]
    }
  ],
  en: [
    {
      id: 'en-home',
      name: 'Home Row (기본 자리)',
      description: '가장 편안한 기본 자리 (A, S, D, F, J, K, L, ;)',
      keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'g', 'h']
    },
    {
      id: 'en-top',
      name: 'Top Row (윗자리)',
      description: '손가락을 위로 뻗는 윗줄 글쇠 (Q, W, E, R, T, Y, U, I, O, P)',
      keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
    },
    {
      id: 'en-bottom',
      name: 'Bottom Row (아랫자리)',
      description: '손가락을 아래로 내리는 아랫줄 글쇠 (Z, X, C, V, B, N, M)',
      keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    },
    {
      id: 'en-all',
      name: 'All Letters (전체 알파벳)',
      description: 'A부터 Z까지 전체 알파벳을 무작위로 연습하기',
      keys: [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z'
      ]
    }
  ]
};

export const WORD_PRACTICE_DATA = {
  ko: [
    // 2글자 단어
    '하늘', '바다', '나무', '구름', '바람', '햇살', '별빛', '달빛', '사과', '포도',
    '딸기', '수박', '참외', '오렌지', '호랑이', '사자', '기린', '토끼', '다람쥐', '강아지',
    '고양이', '학교', '교실', '공책', '연필', '지우개', '가방', '친구', '우정', '사랑',
    '가족', '행복', '미소', '희망', '마음', '음악', '노래', '그림', '운동', '축구',
    '농구', '야구', '수영', '태권도', '피아노', '바이올린', '컴퓨터', '모니터', '키보드', '마우스',
    // 3~4글자 단어
    '대한민국', '무지개', '해바라기', '도서관', '운동장', '자전거', '자동차', '비행기', '우주선',
    '인공지능', '프로그래밍', '알고리즘', '알록달록', '새콤달콤', '반짝반짝', '둥실둥실', '차근차근'
  ],
  en: [
    'cat', 'dog', 'sun', 'sky', 'sea', 'tree', 'star', 'moon', 'wind', 'rain',
    'apple', 'grape', 'banana', 'orange', 'lemon', 'melon', 'water', 'bread', 'milk', 'cake',
    'tiger', 'lion', 'zebra', 'rabbit', 'monkey', 'panda', 'horse', 'sheep', 'duck', 'bear',
    'school', 'book', 'desk', 'chair', 'pencil', 'eraser', 'friend', 'family', 'happy', 'smile',
    'music', 'piano', 'guitar', 'soccer', 'basket', 'tennis', 'swim', 'game', 'play', 'dream',
    'computer', 'keyboard', 'screen', 'mouse', 'code', 'python', 'space', 'galaxy', 'rocket', 'future'
  ]
};

export const SENTENCE_PRACTICE_DATA = {
  ko: [
    '시작이 반이다.',
    '가는 말이 고와야 오는 말이 곱다.',
    '티끌 모아 태산이다.',
    '고생 끝에 낙이 온다.',
    '호랑이도 제 말 하면 온다.',
    '돌다리도 두들겨 보고 건너라.',
    '백지장도 맞들면 낫다.',
    '낮말은 새가 듣고 밤말은 쥐가 듣는다.',
    '천 리 길도 한 걸음부터 시작된다.',
    '아는 것이 힘이고 배움은 보물이다.',
    '세 살 적 버릇이 여든까지 간다.',
    '꿈을 날짜와 함께 적으면 목표가 된다.',
    '연습은 결코 배신하지 않는다.',
    '오늘 걷지 않으면 내일은 뛰어야 한다.',
    '실패는 성공으로 가는 훌륭한 계단이다.',
    '작은 물방울이 모여 큰 바위를 뚫는다.',
    '배움에는 끝이 없고 노력에는 한계가 없다.',
    '어둠이 깊을수록 별은 더욱 빛난다.',
    '행복은 언제나 우리 마음속에 있다.',
    '스스로를 믿는 사람에게 불가능은 없다.'
  ],
  en: [
    'Practice makes perfect.',
    'Knowledge is power.',
    'Actions speak louder than words.',
    'Where there is a will, there is a way.',
    'Better late than never.',
    'Time is gold, do not waste it.',
    'Honesty is always the best policy.',
    'Rome was not built in a day.',
    'Every cloud has a silver lining.',
    'Believe in yourself and anything is possible.',
    'A journey of a thousand miles begins with a single step.',
    'The early bird catches the worm.',
    'Failure is simply the opportunity to begin again.',
    'Stay hungry, stay foolish.',
    'Dream big, work hard, stay humble.',
    'You are stronger than you think.',
    'Great things never come from comfort zones.',
    'Keep your eyes on the stars and your feet on the ground.'
  ]
};
