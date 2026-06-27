/**
 * 🧱 MATHCRAFT - 묶음 수학 모험 (Bundle Math Adventure)
 * Core Game Logic & 3-View Interface Controller
 */

// ==========================================================================
// 1. 게임 상태 관리 (Game State)
// ==========================================================================
const gameState = {
  theme: 'poker',           // 'poker' | 'minecraft' | 'baduk'
  bundleSize: 10,           // 현재 설정된 고정 묶음 크기 (2 | 5 | 10 | 16)
  maxRangeLimit: 80,        // 설정된 최대 숫자 범위 (10 ~ 100)
  isChallengeMode: false,   // 하이브리드(섞어풀기) 챌린지 모드인지 여부
  isHybridMode: false,      // 하이브리드 로직을 타야 하는지 (isChallengeMode와 동의어로 연동)
  currentHybridSize: 10,    // 현재 문제의 실제 묶음 크기 (2 | 5 | 10 | 16)
  
  score: 0,
  bestScore: 0,
  combo: 0,
  trophies: 0,
  stageProgress: 0,         // 현재 스테이지 진행 문제수 (0 ~ 5)
  currentQuestion: null,
  isInputLocked: false,     // 연출 중 더블 클릭 방지 락
  activeCounters: new Set(),// 개별 낱개 세기 인덱스 기억
  activeTimers: new Set()   // 활성화된 2초 자동 닫힘 타이머 ID 보관
};

// ==========================================================================
// 2. 비주얼 테마 정의 (Visual Theme Assets)
// ==========================================================================
const THEMES = {
  poker: {
    avatar: '🎩', // 카드 마술사
    avatarWin: '🎩✨',
    avatarWrong: '🎩💥',
    name: '카드 마술사',
    bundleEmoji: 'card_deck.png', // 카드 다발 이미지 파일
    bundleOpenedEmoji: 'card_deck.png',
    singleEmoji: 'card_single.png', // 낱장 카드 이미지 파일
    hintText: '카드 덱을 누르면 카드들이 낱장으로 펼쳐져서 세어볼 수 있어!',
    textTemplate: '이번엔 {bundle}개씩 {bundles}묶음과 낱장 {singles}장이 있네! 총 카드는 몇 장일까?'
  },
  minecraft: {
    avatar: 'person.png', // 아저씨 그림 이미지 파일
    avatarWin: 'person.png',
    avatarWrong: 'person.png',
    name: '블록 광부',
    bundleEmoji: 'block.png', // 묶음 블록 이미지 파일
    bundleOpenedEmoji: 'block.png', 
    singleEmoji: 'bosuk.png', // 낱개 보석 이미지 파일
    hintText: '상자를 터치해서 열면 보석이 깔끔하게 정렬돼!',
    textTemplate: '{bundle}개들이 상자 {bundles}개랑 낱개 보석 {singles}개가 필요해. 모두 몇 칸을 채울 수 있을까?'
  },
  baduk: {
    avatar: '👴', // 훈장님 / 신선
    avatarWin: '👴👍',
    avatarWrong: '👴❓',
    name: '바둑 신선',
    bundleEmoji: '🟫', // 나무 바둑통 (닫힘)
    bundleOpenedEmoji: '🟡', // 열린 바둑통
    singleEmoji: '⚪', // 흰 바둑알
    hintText: '바둑통을 누르면 바둑돌들이 정렬되어 밖으로 나온단다.',
    textTemplate: '바둑돌 {bundle}개씩 {bundles}통과 낱개 {singles}알이 놓여 있구나. 바둑돌은 총 몇 알이더냐?'
  }
};

// ==========================================================================
// 3. Web Audio API 신시사이저 사운드 매니저 (Synthesizer Sound Manager)
// ==========================================================================
const SoundManager = {
  audioCtx: null,

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  },

  // 1) 묶음 상자 클릭/터치 소리 (가벼운 딸깍)
  playClick() {
    this.init();
    if (!this.audioCtx) return;
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.08);
  },

  // 2) 낱개 알맹이 카운트 소리 (귀여운 방울 소리)
  playCount(index) {
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.type = 'sine';
    const baseFreq = 523.25; // C5
    const freqFactor = Math.pow(1.059, (index % 12));
    
    osc.frequency.setValueAtTime(baseFreq * freqFactor, this.audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.15);
  },

  // 3) 정답 피드백 소리 (맑은 띠롱~ 메이저 코드)
  playCorrect() {
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    
    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  },

  // 4) 오답 피드백 소리 (우우웅 디스코드)
  playWrong() {
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  },

  // 5) 스테이지 완성 축하 음악 (경쾌한 승리 팡파레)
  playVictory() {
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 }, // 도
      { f: 659.25, d: 0.15 }, // 미
      { f: 783.99, d: 0.15 }, // 솔
      { f: 1046.50, d: 0.3 }, // 도
      { f: 783.99, d: 0.15 }, // 솔
      { f: 1046.50, d: 0.6 }  // 도 (길게)
    ];

    let currentStart = now;
    melody.forEach((note) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, currentStart);
      
      gain.gain.setValueAtTime(0.2, currentStart);
      gain.gain.exponentialRampToValueAtTime(0.01, currentStart + note.d);
      
      osc.start(currentStart);
      osc.stop(currentStart + note.d);
      
      currentStart += note.d * 0.9;
    });
  }
};

// ==========================================================================
// 4. 경량 꽃가루(Confetti) 애니메이션 엔진
// ==========================================================================
const ConfettiEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,

  init() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  },

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = this.canvas.parentElement.clientHeight;
    }
  },

  burst() {
    this.particles = [];
    const colors = ['#FF4F73', '#4dedf3', '#FFD700', '#7CE3D1', '#9b5de5', '#f15bb5', '#fee440'];
    const pCount = 80;

    for (let i = 0; i < pCount; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height + 10,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 15 - 5,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (!this.animationId) {
      this.tick();
    }
  },

  tick() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let active = false;

    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.015;

      if (p.opacity > 0 && p.y < this.canvas.height + 20) {
        active = true;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;
        if (p.size % 2 === 0) {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }
    });

    if (active) {
      this.animationId = requestAnimationFrame(() => this.tick());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationId = null;
    }
  }
};

// ==========================================================================
// 5. 뷰(화면) 전환 시스템 (View Switcher)
// ==========================================================================
function changeView(viewId) {
  document.querySelectorAll('.game-view').forEach((view) => {
    view.classList.remove('active');
  });
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }
  
  // 캔버스 크기 재조정
  ConfettiEngine.resizeCanvas();
}

// ==========================================================================
// 6. 게임 기능 로직 (Game Mechanics)
// ==========================================================================

// 1) 설정된 묶음크기 및 숫자 한계 범위(Limit) 내에서 100% 모순 없는 랜덤 퀴즈 생성
function generateQuestion() {
  // 하이브리드(Challenge) 모드인 경우 매 문제마다 묶음 크기를 무작위 선택
  if (gameState.isChallengeMode) {
    const hybridUnits = [2, 5, 10, 16];
    gameState.currentHybridSize = hybridUnits[Math.floor(Math.random() * hybridUnits.length)];
    gameState.isHybridMode = true;
  } else {
    gameState.currentHybridSize = gameState.bundleSize;
    gameState.isHybridMode = false;
  }

  const bSize = gameState.currentHybridSize;
  const limit = gameState.maxRangeLimit; // 사용자가 설정한 슬라이더 최대 숫자
  
  // 수학적 최대 묶음수 계산
  const maxBundles = Math.max(1, Math.floor(limit / bSize));
  
  // 묶음 개수를 랜덤하게 뽑음 (최소 1묶음)
  const bundles = Math.floor(Math.random() * maxBundles) + 1;
  
  // 낱개 뽑기 (정답 합산이 limit를 절대 초과하지 않도록 낱개 상한을 동적 통제)
  let singles = 0;
  if (bundles === Math.floor(limit / bSize)) {
    // 묶음이 최대한 꽉 찬 상태라면, 낱개는 남는 범위(limit % bSize) 이하로만 나와야 함
    const maxSinglesAllowed = limit % bSize;
    singles = Math.floor(Math.random() * (maxSinglesAllowed + 1));
  } else {
    // 여유가 있을 때는 묶음 단위 한계선인 bSize - 1 만큼 자유롭게 출제
    singles = Math.floor(Math.random() * bSize);
  }
  
  const targetNumber = bundles * bSize + singles;

  // 보기(선택지) 생성 (3지 선다)
  const choices = new Set([targetNumber]);
  
  // 오답 패턴 1: 10의 묶음일 때 묶음과 낱개를 거꾸로 합친 경우 (예: 10개들이 3묶음에 낱개 6개 -> 63)
  if (bSize === 10 && bundles > 0 && singles > 0 && bundles !== singles) {
    const swapped = singles * 10 + bundles;
    if (swapped <= limit && swapped > 0) choices.add(swapped);
  }
  
  // 오답 패턴 2: 묶음 수와 낱개 수를 단순 합산한 경우 (예: 3묶음 6개 -> 3 + 6 = 9)
  const addedSimple = bundles + singles;
  if (addedSimple !== targetNumber && addedSimple > 0) {
    choices.add(addedSimple);
  }

  // 오답 패턴 3: 정답에서 묶음 한 개 차이 (± bSize)
  const offsetBundleAdd = targetNumber + bSize;
  const offsetBundleSub = targetNumber - bSize;
  if (offsetBundleAdd <= limit) choices.add(offsetBundleAdd);
  if (offsetBundleSub > 0) choices.add(offsetBundleSub);

  // 오답 패턴 4: 낱개 수 1개 차이 (± 1)
  const offsetOneAdd = targetNumber + 1;
  const offsetOneSub = targetNumber - 1;
  if (offsetOneAdd <= limit) choices.add(offsetOneAdd);
  if (offsetOneSub > 0) choices.add(offsetOneSub);

  // 보기 3개 보충
  while (choices.size < 3) {
    const randomDiff = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
    const filler = targetNumber + randomDiff;
    if (filler > 0 && filler <= limit) {
      choices.add(filler);
    }
  }

  // 3개 보기 셔플
  const choicesArray = Array.from(choices);
  choicesArray.sort(() => Math.random() - 0.5);

  gameState.currentQuestion = {
    targetNumber,
    bundles,
    singles,
    choices: choicesArray,
    answered: false
  };
}

// 2) 게임 화면 그리기 (DOM Rendering)
function renderBoard() {
  const q = gameState.currentQuestion;
  const themeData = THEMES[gameState.theme];
  
  // 실제 묶음 단위 표시 (하이브리드 지원)
  const activeUnit = gameState.currentHybridSize;
  document.getElementById('bundle-unit-display').textContent = activeUnit;

  // 질문 아바타 및 텍스트 렌더링
  const avatarEl = document.getElementById('character-avatar');
  const questionEl = document.getElementById('question-text');
  
  if (themeData.avatar.endsWith('.png')) {
    avatarEl.innerHTML = `<img src="${themeData.avatar}" alt="${themeData.name}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;" />`;
  } else {
    avatarEl.textContent = themeData.avatar;
  }
  
  // 텍스트 템플릿 치환
  let qText = themeData.textTemplate
    .replace('{bundle}', activeUnit)
    .replace('{bundles}', q.bundles)
    .replace('{singles}', q.singles);
  questionEl.textContent = qText;

  // 힌트 텍스트 갱신 (하이브리드 모드 경고 문구 추가)
  if (gameState.isHybridMode) {
    document.getElementById('hint-bubble-text').innerHTML = `⚠️ 이번엔 <strong>${activeUnit}개씩</strong> 묶음이야! 문제를 꼼꼼하게 잘 읽어야 해!`;
  } else {
    document.getElementById('hint-bubble-text').textContent = themeData.hintText;
  }

  // --- 묶음 영역 렌더링 ---
  const bundleContainer = document.getElementById('bundle-container');
  bundleContainer.innerHTML = '';
  
  for (let i = 0; i < q.bundles; i++) {
    const box = document.createElement('div');
    box.className = 'bundle-box';
    box.dataset.index = i;
    
    // 에셋 이모지 또는 이미지
    const asset = document.createElement('span');
    asset.className = 'bundle-asset';
    if (themeData.bundleEmoji.endsWith('.png')) {
      asset.innerHTML = `<img src="${themeData.bundleEmoji}" alt="bundle" style="width: 48px; height: 48px; object-fit: contain; image-rendering: pixelated;" />`;
    } else {
      asset.textContent = themeData.bundleEmoji;
    }
    box.appendChild(asset);
    
    // 텍스트 라벨
    const label = document.createElement('span');
    label.className = 'bundle-label';
    label.textContent = `${activeUnit}개 묶음`;
    box.appendChild(label);
    
    // 클릭/터치 이벤트: 낱개 분해 연출
    box.addEventListener('touchstart', (e) => {
      e.preventDefault();
      toggleBundleBox(box, i);
    });
    box.addEventListener('click', () => {
      toggleBundleBox(box, i);
    });

    bundleContainer.appendChild(box);
  }

  // --- 낱개 영역 렌더링 ---
  const singleContainer = document.getElementById('single-container');
  singleContainer.innerHTML = '';
  gameState.activeCounters.clear();
  
  for (let i = 0; i < q.singles; i++) {
    const single = document.createElement('div');
    single.className = 'single-item';
    single.dataset.index = i;
    
    if (gameState.theme === 'baduk') {
      single.textContent = (i % 2 === 0) ? '⚪' : '⚫';
    } 
    else if (gameState.theme === 'poker') {
      if (themeData.singleEmoji.endsWith('.png')) {
        const imgHeight = themeData.singleEmoji.includes('card') ? '38px' : '28px';
        single.innerHTML = `<img src="${themeData.singleEmoji}" alt="single" style="width: 28px; height: ${imgHeight}; object-fit: contain; image-rendering: pixelated;" />`;
      } else {
        single.textContent = themeData.singleEmoji;
      }
    } 
    else {
      if (themeData.singleEmoji.endsWith('.png')) {
        single.innerHTML = `<img src="${themeData.singleEmoji}" alt="single" style="width: 28px; height: 28px; object-fit: contain; image-rendering: pixelated;" />`;
      } else {
        single.textContent = themeData.singleEmoji;
      }
    }
    
    const clickHandler = (e) => {
      if (e) e.preventDefault();
      toggleSingleCounter(single, i);
    };
    single.addEventListener('touchstart', clickHandler);
    single.addEventListener('click', clickHandler);

    singleContainer.appendChild(single);
  }

  // --- 선택지 카드 렌더링 ---
  const choicesWrapper = document.getElementById('choices-wrapper');
  choicesWrapper.innerHTML = '';

  q.choices.forEach((choiceVal) => {
    const card = document.createElement('button');
    card.className = 'choice-card';
    card.textContent = `${choiceVal}개`;
    
    const clickHandler = (e) => {
      if (e) e.preventDefault();
      handleChoiceSelection(card, choiceVal);
    };
    card.addEventListener('touchstart', clickHandler);
    card.addEventListener('click', clickHandler);

    choicesWrapper.appendChild(card);
  });
}

// 3) 묶음 박스 클릭 인터랙션 (열기/분해)
function toggleBundleBox(boxEl, index) {
  if (gameState.isInputLocked) return;
  
  SoundManager.playClick();
  
  // 이미 열려 있으면 수동 닫기 처리
  if (boxEl.classList.contains('opened')) {
    // 기존에 예약되어 있던 2초 타이머 파기
    if (boxEl.dataset.timeoutId) {
      const tId = parseInt(boxEl.dataset.timeoutId, 10);
      clearTimeout(tId);
      gameState.activeTimers.delete(tId);
      delete boxEl.dataset.timeoutId;
    }
    
    boxEl.classList.remove('opened');
    const assetEl = boxEl.querySelector('.bundle-asset');
    if (THEMES[gameState.theme].bundleEmoji.endsWith('.png')) {
      assetEl.innerHTML = `<img src="${THEMES[gameState.theme].bundleEmoji}" alt="bundle" style="width: 48px; height: 48px; object-fit: contain; image-rendering: pixelated;" />`;
    } else {
      assetEl.textContent = THEMES[gameState.theme].bundleEmoji;
    }
    const subGrid = boxEl.querySelector('.bundle-sub-grid');
    if (subGrid) subGrid.remove();
    return;
  }

  boxEl.classList.add('opened');
  const assetEl = boxEl.querySelector('.bundle-asset');
  if (THEMES[gameState.theme].bundleOpenedEmoji.endsWith('.png')) {
    assetEl.innerHTML = `<img src="${THEMES[gameState.theme].bundleOpenedEmoji}" alt="bundle" style="width: 48px; height: 48px; object-fit: contain; image-rendering: pixelated;" />`;
  } else {
    assetEl.textContent = THEMES[gameState.theme].bundleOpenedEmoji;
  }

  const activeUnit = gameState.currentHybridSize;
  const subGrid = document.createElement('div');
  subGrid.className = `bundle-sub-grid grid-unit-${activeUnit}`;
  
  const bSize = activeUnit;
  for (let s = 0; s < bSize; s++) {
    const innerSingle = document.createElement('span');
    innerSingle.style.fontSize = activeUnit === 16 ? '12px' : (activeUnit === 10 ? '16px' : '22px');
    innerSingle.style.textAlign = 'center';
    innerSingle.style.display = 'flex';
    innerSingle.style.justifyContent = 'center';
    innerSingle.style.alignItems = 'center';
    innerSingle.style.cursor = 'pointer';
    innerSingle.style.position = 'relative';

    if (gameState.theme === 'baduk') {
      innerSingle.textContent = (s % 2 === 0) ? '⚪' : '⚫';
    } else {
      if (THEMES[gameState.theme].singleEmoji.endsWith('.png')) {
        const imgHeight = THEMES[gameState.theme].singleEmoji.includes('card') ? '22px' : '16px';
        innerSingle.innerHTML = `<img src="${THEMES[gameState.theme].singleEmoji}" alt="single" style="width: 16px; height: ${imgHeight}; object-fit: contain; image-rendering: pixelated;" />`;
      } else {
        innerSingle.textContent = THEMES[gameState.theme].singleEmoji;
      }
    }

    innerSingle.addEventListener('click', (e) => {
      e.stopPropagation(); // 묶음 박스 닫히는 클릭 전파 방지
      SoundManager.playCount(s + 1);
      
      const bubble = innerSingle.querySelector('.count-bubble');
      if (bubble) {
        bubble.remove();
      } else {
        const num = document.createElement('span');
        num.className = 'count-bubble';
        num.style.fontSize = '8px';
        num.style.width = '12px';
        num.style.height = '12px';
        num.style.top = '-2px';
        num.style.right = '-2px';
        num.textContent = s + 1;
        innerSingle.appendChild(num);
      }
    });

    subGrid.appendChild(innerSingle);
  }

  boxEl.appendChild(subGrid);

  // 2초 뒤 자동 닫기 타이머 예약 및 gameState 수집
  const timeoutId = setTimeout(() => {
    if (boxEl && boxEl.classList.contains('opened')) {
      boxEl.classList.remove('opened');
      const currentAssetEl = boxEl.querySelector('.bundle-asset');
      const currentTheme = gameState.theme;
      if (currentAssetEl) {
        if (THEMES[currentTheme].bundleEmoji.endsWith('.png')) {
          currentAssetEl.innerHTML = `<img src="${THEMES[currentTheme].bundleEmoji}" alt="bundle" style="width: 48px; height: 48px; object-fit: contain; image-rendering: pixelated;" />`;
        } else {
          currentAssetEl.textContent = THEMES[currentTheme].bundleEmoji;
        }
      }
      const activeSubGrid = boxEl.querySelector('.bundle-sub-grid');
      if (activeSubGrid) activeSubGrid.remove();
    }
    gameState.activeTimers.delete(timeoutId);
  }, 2000);
  gameState.activeTimers.add(timeoutId);
  boxEl.dataset.timeoutId = timeoutId;
}

// 4) 낱개 아이템 개별 카운트 토글
function toggleSingleCounter(singleEl, index) {
  if (gameState.isInputLocked) return;

  const bubble = singleEl.querySelector('.count-bubble');
  if (bubble) {
    bubble.remove();
    gameState.activeCounters.delete(index);
  } else {
    SoundManager.playCount(gameState.activeCounters.size + 1);
    
    const numEl = document.createElement('span');
    numEl.className = 'count-bubble';
    
    gameState.activeCounters.add(index);
    numEl.textContent = gameState.activeCounters.size;
    singleEl.appendChild(numEl);
  }
}

// 5) 정답 선택 시 판정 로직
function handleChoiceSelection(cardEl, value) {
  if (gameState.isInputLocked || gameState.currentQuestion.answered) return;

  const q = gameState.currentQuestion;
  const themeData = THEMES[gameState.theme];
  const avatarEl = document.getElementById('character-avatar');

  if (value === q.targetNumber) {
    q.answered = true;
    gameState.isInputLocked = true;
    
    cardEl.classList.add('correct');
    if (themeData.avatarWin.endsWith('.png')) {
      avatarEl.innerHTML = `<img src="${themeData.avatarWin}" alt="${themeData.name}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;" />`;
    } else {
      avatarEl.textContent = themeData.avatarWin;
    }
    
    gameState.score += 10 + (gameState.combo * 2);
    gameState.combo += 1;
    gameState.stageProgress += 1;

    document.getElementById('current-score').textContent = gameState.score;
    document.getElementById('combo-count').textContent = gameState.combo;
    
    if (gameState.score > gameState.bestScore) {
      gameState.bestScore = gameState.score;
      document.getElementById('best-score').textContent = gameState.bestScore;
      localStorage.setItem('bundle_math_best_score', gameState.bestScore);
    }

    SoundManager.playCorrect();
    ConfettiEngine.burst();

    setTimeout(() => {
      if (gameState.stageProgress >= 5) {
        triggerStageClear();
      } else {
        gameState.isInputLocked = false;
        loadNextQuestion();
      }
    }, 1500);

  } else {
    SoundManager.playWrong();
    cardEl.classList.add('wrong');
    if (themeData.avatarWrong.endsWith('.png')) {
      avatarEl.innerHTML = `<img src="${themeData.avatarWrong}" alt="${themeData.name}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;" />`;
    } else {
      avatarEl.textContent = themeData.avatarWrong;
    }
    
    // 틀렸을 때 점수와 콤보를 0으로 리셋
    gameState.score = 0;
    gameState.combo = 0;
    document.getElementById('current-score').textContent = '0';
    document.getElementById('combo-count').textContent = '0';

    setTimeout(() => {
      cardEl.classList.remove('wrong');
      if (themeData.avatar.endsWith('.png')) {
        avatarEl.innerHTML = `<img src="${themeData.avatar}" alt="${themeData.name}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;" />`;
      } else {
        avatarEl.textContent = themeData.avatar;
      }
    }, 600);

    const questionEl = document.getElementById('question-text');
    questionEl.innerHTML = `<span style="color:#d32f2f; font-weight:bold;">앗, 아쉬워라! 😢 점수와 콤보가 모두 0이 되었어.</span><br>묶음 상자/카드다발을 터치해서 낱개로 연 뒤 손가락으로 천천히 세어보자!`;
  }
}

// 6) 스테이지 클리어 트리거
function triggerStageClear() {
  gameState.trophies += 1;
  document.getElementById('trophy-count').textContent = gameState.trophies;
  localStorage.setItem('bundle_math_trophies', gameState.trophies);
  
  SoundManager.playVictory();
  
  const overlay = document.getElementById('victory-overlay');
  overlay.classList.add('show');
}

// 모든 활성화된 2초 자동 닫힘 타이머 제거
function clearAllTimers() {
  if (gameState.activeTimers) {
    gameState.activeTimers.forEach((timerId) => clearTimeout(timerId));
    gameState.activeTimers.clear();
  }
}

// 7) 다음 문제 로드
function loadNextQuestion() {
  clearAllTimers(); // 다음 문제로 가기 전 살아있는 타이머 제거
  generateQuestion();
  renderBoard();
}

// ==========================================================================
// 7. UI 설정 제어 및 초기화 (Controls & Init)
// ==========================================================================

function initApp() {
  // 로컬 스토리지 데이터 로드
  const savedBest = localStorage.getItem('bundle_math_best_score');
  if (savedBest) {
    gameState.bestScore = parseInt(savedBest, 10);
    document.getElementById('best-score').textContent = gameState.bestScore;
  }
  
  const savedTrophies = localStorage.getItem('bundle_math_trophies');
  if (savedTrophies) {
    gameState.trophies = parseInt(savedTrophies, 10);
    document.getElementById('trophy-count').textContent = gameState.trophies;
  }

  // 꽃가루 엔진 시작
  ConfettiEngine.init();

  // --- 이벤트 리스너 바인딩 ---

  // [설정 화면] 뒤로가기 버튼 -> 상위 폴더 루트 로비로 복귀
  const backToLobbyFromSetupBtn = document.getElementById('btn-back-to-lobby-from-setup');
  backToLobbyFromSetupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    SoundManager.playClick();
    window.location.href = '../index.html';
  });

  // [설정 화면] 묶음 선택 토글 버튼 바인딩 (2, 5, 10, 16)
  const setupBundleBtns = document.querySelectorAll('[data-setup-bundle]');
  setupBundleBtns.forEach((btn) => {
    const handler = (e) => {
      e.preventDefault();
      SoundManager.playClick();
      setupBundleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.bundleSize = parseInt(btn.dataset.setupBundle, 10);
    };
    btn.addEventListener('touchstart', handler);
    btn.addEventListener('click', handler);
  });

  // [설정 화면] 숫자 범위 슬라이더 설정 및 -/+ 조작
  const rangeSlider = document.getElementById('slider-range-limit');
  const rangeText = document.getElementById('range-limit-text');
  
  const updateRangeDisplay = (val) => {
    gameState.maxRangeLimit = parseInt(val, 10);
    rangeText.textContent = val;
    rangeSlider.value = val;
  };

  rangeSlider.addEventListener('input', (e) => {
    updateRangeDisplay(e.target.value);
  });

  document.getElementById('btn-range-minus').addEventListener('click', (e) => {
    e.preventDefault();
    SoundManager.playClick();
    let currentVal = parseInt(rangeSlider.value, 10);
    if (currentVal > 10) {
      updateRangeDisplay(currentVal - 5);
    }
  });

  document.getElementById('btn-range-plus').addEventListener('click', (e) => {
    e.preventDefault();
    SoundManager.playClick();
    let currentVal = parseInt(rangeSlider.value, 10);
    if (currentVal < 100) {
      updateRangeDisplay(currentVal + 5);
    }
  });

  // [설정 화면] Start 버튼 (일반 모드로 게임 시작)
  const startGameBtn = document.getElementById('btn-start-game1');
  startGameBtn.addEventListener('click', (e) => {
    e.preventDefault();
    SoundManager.playClick();
    gameState.isChallengeMode = false;
    gameState.isHybridMode = false;
    loadNextQuestion();
    changeView('view-game');
  });

  // [설정 화면] Challenge 버튼 (하이브리드 모드로 게임 시작)
  const challengeGameBtn = document.getElementById('btn-challenge-game1');
  challengeGameBtn.addEventListener('click', (e) => {
    e.preventDefault();
    SoundManager.playClick();
    gameState.isChallengeMode = true;
    gameState.isHybridMode = true;
    loadNextQuestion();
    changeView('view-game');
  });

  // [게임 화면] 처음으로 나가기 버튼 -> 상위 폴더 루트 로비로 복귀
  const backToLobbyFromGameBtn = document.getElementById('btn-back-to-lobby-from-game');
  backToLobbyFromGameBtn.addEventListener('click', (e) => {
    e.preventDefault();
    SoundManager.playClick();
    
    // 점수 진행도 및 콤보는 로비로 갈 때 가볍게 리셋
    gameState.stageProgress = 0;
    gameState.combo = 0;
    document.getElementById('combo-count').textContent = '0';
    gameState.isInputLocked = false;

    window.location.href = '../index.html';
  });

  // [설정 화면] 디자인 테마 선택 토글 버튼 바인딩 (poker, minecraft, baduk)
  const setupThemeBtns = document.querySelectorAll('[data-setup-theme]');
  setupThemeBtns.forEach((btn) => {
    const handler = (e) => {
      e.preventDefault();
      SoundManager.playClick();
      
      setupThemeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      
      const selectedTheme = btn.dataset.setupTheme;
      gameState.theme = selectedTheme;
      document.body.className = `theme-${selectedTheme}`;
    };
    btn.addEventListener('touchstart', handler);
    btn.addEventListener('click', handler);
  });

  // [게임 화면] 다음 스테이지 버튼 (오버레이용)
  const nextStageBtn = document.getElementById('btn-next-stage');
  const nextStageHandler = (e) => {
    e.preventDefault();
    SoundManager.playClick();
    
    document.getElementById('victory-overlay').classList.remove('show');
    gameState.stageProgress = 0;
    gameState.isInputLocked = false;
    
    loadNextQuestion();
  };
  nextStageBtn.addEventListener('touchstart', nextStageHandler);
  nextStageBtn.addEventListener('click', nextStageHandler);

  // 브라우저 뷰포트 스크롤 및 핀치 줌을 원천 방지하기 위해 터치 무효화 처리
  document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) { 
      e.preventDefault(); 
    }
  }, { passive: false });
}

window.addEventListener('DOMContentLoaded', initApp);
