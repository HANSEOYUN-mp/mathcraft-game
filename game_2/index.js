/**
 * 🔮 구십구 마스터: 숫자 마법사 - 핵심 게임 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM 요소 참조 ---
  const viewSetup = document.getElementById('view-setup');
  const viewGame = document.getElementById('view-game');
  
  const btnBackToLobby = document.getElementById('btn-back-to-lobby-from-setup');
  const btnBackToSetup = document.getElementById('btn-back-to-setup-from-game');
  const btnStartGame = document.getElementById('btn-start-game');
  
  const currentModeLabel = document.getElementById('current-mode-label');
  const trophyCountDisplay = document.getElementById('trophy-count');
  const gameScoreDisplay = document.getElementById('game-score');
  const comboBadge = document.getElementById('combo-badge');
  const comboCountDisplay = document.getElementById('combo-count');
  
  // 패널 뷰
  const panelElevator = document.getElementById('panel-elevator');
  const panelTraining = document.getElementById('panel-training');
  const panelBattle = document.getElementById('panel-battle');
  
  // 오버레이 팝업
  const victoryOverlay = document.getElementById('victory-overlay');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  
  const btnNextStage = document.getElementById('btn-next-stage');
  const btnRetryBattle = document.getElementById('btn-retry-battle');
  const btnExitToSetupVictory = document.getElementById('btn-exit-to-setup-victory');
  const btnExitToSetupGameover = document.getElementById('btn-exit-to-setup-gameover');
  const finalScoreDisplay = document.getElementById('final-score');
  
  // --- 글로벌 게임 상태 ---
  let currentMode = 'elevator'; // 'elevator' | 'training' | 'battle'
  let trophyCount = parseInt(localStorage.getItem('mathcraft_g2_trophies') || '0', 10);
  let gameScore = 0;
  let comboCount = 0;
  
  // 트로피 UI 업데이트
  trophyCountDisplay.textContent = trophyCount;
  
  // --- 모드별 개별 상태 ---
  const elevatorState = {
    currentNum: 15,
    missionNum: null,
    isMoving: false
  };
  
  const trainingState = {
    currentQuestion: null,
    solvedCount: 0,
    targetCount: 5,
    activeTimeout: null,
    firstTry: true
  };
  
  const battleState = {
    barrierVal: 50,
    hand: [],
    reshuffleLeft: 3
  };
  
  // --- 1. 화면 전환 및 기본 이벤트 바인딩 ---
  
  // 뒤로 가기: 메인 로비로 이동
  if (btnBackToLobby) {
    const toLobby = () => {
      window.location.href = '../index.html';
    };
    btnBackToLobby.addEventListener('click', toLobby);
    btnBackToLobby.addEventListener('touchstart', (e) => { e.preventDefault(); toLobby(); });
  }
  
  // 뒤로 가기: 게임 화면에서 모드선택(셋업)으로 복귀
  if (btnBackToSetup) {
    const toSetup = () => {
      stopAllRunningGames();
      viewGame.classList.remove('active');
      viewSetup.classList.add('active');
    };
    btnBackToSetup.addEventListener('click', toSetup);
    btnBackToSetup.addEventListener('touchstart', (e) => { e.preventDefault(); toSetup(); });
  }
  
  // 모드 카드 선택 효과
  const modeCards = document.querySelectorAll('.mode-card');
  modeCards.forEach(card => {
    const selectCard = () => {
      modeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentMode = card.getAttribute('data-mode');
    };
    card.addEventListener('click', selectCard);
    card.addEventListener('touchstart', (e) => {
      e.preventDefault();
      selectCard();
    });
  });
  
  // 게임 시작 버튼 누를 때
  if (btnStartGame) {
    const startGame = () => {
      viewSetup.classList.remove('active');
      viewGame.classList.add('active');
      initSelectedMode();
    };
    btnStartGame.addEventListener('click', startGame);
    btnStartGame.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); });
  }
  
  // 오버레이 공통 퇴장 버튼
  [btnExitToSetupVictory, btnExitToSetupGameover].forEach(btn => {
    if (btn) {
      const exit = () => {
        victoryOverlay.classList.remove('active');
        gameoverOverlay.classList.remove('active');
        stopAllRunningGames();
        viewGame.classList.remove('active');
        viewSetup.classList.add('active');
      };
      btn.addEventListener('click', exit);
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); exit(); });
    }
  });

  // 다음 수련하기 (연습 모드 완료 후)
  if (btnNextStage) {
    const nextStage = () => {
      victoryOverlay.classList.remove('active');
      initSelectedMode();
    };
    btnNextStage.addEventListener('click', nextStage);
    btnNextStage.addEventListener('touchstart', (e) => { e.preventDefault(); nextStage(); });
  }

  // 다시 도전 (실전 모드 오버 후)
  if (btnRetryBattle) {
    const retry = () => {
      gameoverOverlay.classList.remove('active');
      initSelectedMode();
    };
    btnRetryBattle.addEventListener('click', retry);
    btnRetryBattle.addEventListener('touchstart', (e) => { e.preventDefault(); retry(); });
  }
  
  // --- 2. 게임 초기화 분기 ---
  function initSelectedMode() {
    // 패널 가리기
    panelElevator.style.display = 'none';
    panelTraining.style.display = 'none';
    panelBattle.style.display = 'none';
    
    // 오버레이 초기화
    victoryOverlay.classList.remove('active');
    gameoverOverlay.classList.remove('active');
    
    // 점수/콤보 바 초기화
    gameScore = 0;
    comboCount = 0;
    gameScoreDisplay.textContent = gameScore;
    comboBadge.style.display = 'none';
    
    if (currentMode === 'elevator') {
      currentModeLabel.textContent = '🛗 10층 숫자 엘리베이터';
      panelElevator.style.display = 'flex';
      setupElevatorMode();
    } else if (currentMode === 'training') {
      currentModeLabel.textContent = '⚡ 마법사의 보수 연습';
      panelTraining.style.display = 'flex';
      setupTrainingMode();
    } else if (currentMode === 'battle') {
      currentModeLabel.textContent = '🛡️ 구십구 마법 장벽';
      panelBattle.style.display = 'flex';
      setupBattleMode();
    }
  }
  
  function stopAllRunningGames() {
    if (trainingState.activeTimeout) {
      clearTimeout(trainingState.activeTimeout);
      trainingState.activeTimeout = null;
    }
    // 캐릭터 아바타 토큰 제거 등 리셋 정리
    const existingToken = document.querySelector('.char-token');
    if (existingToken) existingToken.remove();
  }
  
  
  // ==========================================================================
  // 🛗 [모드 1] 10층 숫자 엘리베이터 로직
  // ==========================================================================
  
  const eleGrid = document.getElementById('elevator-grid');
  const eleCurrentNumDisp = document.getElementById('elevator-current-num');
  const eleMathGuide = document.getElementById('elevator-math-guide');
  
  function setupElevatorMode() {
    eleGrid.innerHTML = '';
    elevatorState.currentNum = 15;
    elevatorState.isMoving = false;
    eleCurrentNumDisp.textContent = elevatorState.currentNum;
    
    // 100판 그리드 동적 생성 (1 ~ 99)
    for (let i = 1; i <= 100; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.setAttribute('data-num', i);
      
      if (i === 100) {
        cell.innerHTML = '🔒';
        cell.style.opacity = '0.5';
      } else {
        cell.textContent = i;
      }
      
      eleGrid.appendChild(cell);
    }
    
    // 캐릭터 말 엘리먼트 생성 및 배치
    let charToken = document.querySelector('.char-token');
    if (!charToken) {
      charToken = document.createElement('div');
      charToken.className = 'char-token';
      charToken.textContent = '🧙‍♂️';
      eleGrid.appendChild(charToken);
    }
    
    // 화면 크기 조정에 대응하기 위한 포지셔닝 헬퍼
    setTimeout(() => {
      positionCharToken(elevatorState.currentNum, false);
      setNewElevatorMission();
    }, 100);
    
    // 제어 버튼 바인딩
    const eleBtns = document.querySelectorAll('.ele-btn');
    eleBtns.forEach(btn => {
      // 이벤트 복제 방지를 위해 클론
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      const handleMove = () => {
        if (elevatorState.isMoving) return;
        const val = parseInt(newBtn.getAttribute('data-val'), 10);
        moveElevator(val);
      };
      
      newBtn.addEventListener('click', handleMove);
      newBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMove();
      });
    });
  }
  
  // 수 배열판 위의 특정 셀 좌표를 계산해서 토큰 위치시킴
  function positionCharToken(num, animate = true) {
    const targetCell = eleGrid.querySelector(`.grid-cell[data-num="${num}"]`);
    const token = document.querySelector('.char-token');
    if (!targetCell || !token) return;
    
    // 그리드 하이라이트 클래스 전체 초기화
    const cells = eleGrid.querySelectorAll('.grid-cell');
    cells.forEach(c => c.classList.remove('active-pos'));
    targetCell.classList.add('active-pos');
    
    // 타겟 셀의 상대적 오프셋 계산
    const cellLeft = targetCell.offsetLeft;
    const cellTop = targetCell.offsetTop;
    const cellWidth = targetCell.offsetWidth;
    const cellHeight = targetCell.offsetHeight;
    
    token.style.width = `${cellWidth}px`;
    token.style.height = `${cellHeight}px`;
    
    if (animate) {
      token.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      token.style.transition = 'none';
    }
    
    token.style.left = `${cellLeft}px`;
    token.style.top = `${cellTop}px`;
  }
  
  // 10층 엘리베이터 이동 연산 처리
  function moveElevator(diff) {
    const startNum = elevatorState.currentNum;
    const targetNum = startNum + diff;
    
    // 오버플로우 체크 (1 ~ 99 범위를 넘으면 무시)
    if (targetNum < 1 || targetNum > 99) {
      eleMathGuide.innerHTML = `⚠️ <b>${targetNum}층</b>은 마법 격자판 범위를 벗어납니다! 이동할 수 없어요.`;
      return;
    }
    
    elevatorState.isMoving = true;
    elevatorState.currentNum = targetNum;
    eleCurrentNumDisp.textContent = targetNum;
    
    // 보수 이동 경로 하이라이트 애니메이션 시뮬레이션
    visualizeElevatorPath(startNum, diff, targetNum);
  }
  
  // 보수 경로 연출 애니메이션
  function visualizeElevatorPath(start, diff, end) {
    const absDiff = Math.abs(diff);
    const cells = eleGrid.querySelectorAll('.grid-cell');
    cells.forEach(c => c.classList.remove('path-highlight'));
    
    let text = '';
    
    if (absDiff === 10) {
      // +10 또는 -10 (수직 1칸 이동)
      const intermediate = start + diff;
      positionCharToken(intermediate, true);
      text = diff > 0 
        ? `🔥 <b>${start}에서 +10!</b> 십의 자리가 1 늘어나 바로 아래층(<b>${end}</b>)으로 1칸 내려왔어요!` 
        : `🔥 <b>${start}에서 -10!</b> 십의 자리가 1 줄어들어 바로 위층(<b>${end}</b>)으로 1칸 올라갔어요!`;
      
      updateElevatorMathGuideAndFinish(text);
    } else {
      // 9, 8, 7, 6 묶음 보수 이동 (예: +9 = +10 후 -1)
      const tenDiff = diff > 0 ? 10 : -10;
      const step1 = start + tenDiff; // 1단계: 10이동
      const step2 = end;            // 2단계: 보수 보정
      const backAmount = Math.abs(tenDiff) - absDiff;
      const backSign = diff > 0 ? '-' : '+';
      
      // 1단계: 십의 자리 10 이동
      positionCharToken(step1, true);
      const step1Cell = eleGrid.querySelector(`.grid-cell[data-num="${step1}"]`);
      if (step1Cell) step1Cell.classList.add('path-highlight');
      
      text = diff > 0
        ? `🪄 <b>${start}에서 +${absDiff}의 마법!</b><br>1단계: 먼저 <b>10</b>을 더해서 <b>${step1}</b>로 가고...`
        : `🪄 <b>${start}에서 -${absDiff}의 마법!</b><br>1단계: 먼저 <b>10</b>을 빼서 <b>${step1}</b>로 가고...`;
      eleMathGuide.innerHTML = text;
      
      // 0.4초 후 2단계 보정
      setTimeout(() => {
        positionCharToken(step2, true);
        const step2Cell = eleGrid.querySelector(`.grid-cell[data-num="${step2}"]`);
        if (step2Cell) {
          if (step1Cell) step1Cell.classList.remove('path-highlight');
          step2Cell.classList.add('path-highlight');
        }
        
        text += diff > 0
          ? `<br>2단계: 너무 많이 갔으니 다시 <b>${backAmount}</b>을 빼서(<b>${backSign}${backAmount}</b>) 최종 <b>${end}</b>에 도착!`
          : `<br>2단계: 너무 많이 뺐으니 다시 <b>${backAmount}</b>을 더해서(<b>${backSign}${backAmount}</b>) 최종 <b>${end}</b>에 도착!`;
        
        updateElevatorMathGuideAndFinish(text);
      }, 550);
    }
  }
  
  function updateElevatorMathGuideAndFinish(text) {
    eleMathGuide.innerHTML = text;
    
    // 미션 확인
    if (elevatorState.currentNum === elevatorState.missionNum) {
      setTimeout(() => {
        triggerConfetti();
        gameScore += 20;
        gameScoreDisplay.textContent = gameScore;
        
        // 100점 돌파 시 트로피/별 획득
        if (gameScore % 100 === 0 || gameScore === 20) {
          gainTrophy();
        }
        
        eleMathGuide.innerHTML += `<br><br><span style="color:#ffd700; font-weight:bold; font-size:18px;">🎉 미션 성공! 별의 에너지를 얻었습니다! (+20점)</span>`;
        setNewElevatorMission();
      }, 600);
    }
    
    setTimeout(() => {
      elevatorState.isMoving = false;
    }, 600);
  }
  
  function setNewElevatorMission() {
    let rand;
    do {
      rand = Math.floor(Math.random() * 98) + 1; // 1 ~ 98
    } while (rand === elevatorState.currentNum);
    
    elevatorState.missionNum = rand;
    
    // 미션 안내 팝업 혹은 격자에 표시
    const cells = eleGrid.querySelectorAll('.grid-cell');
    cells.forEach(c => c.style.borderColor = '');
    
    const targetCell = eleGrid.querySelector(`.grid-cell[data-num="${rand}"]`);
    if (targetCell) {
      targetCell.style.borderColor = '#f1c40f';
    }
    
    eleMathGuide.innerHTML += `<br><br>🎯 <b>마법의 포탈 미션:</b> 엘리베이터를 타고 <b>${rand}층</b>으로 가봐!`;
  }
  
  
  // ==========================================================================
  // ⚡ [모드 2] 마법사의 보수 트레이닝 로직
  // ==========================================================================
  
  const trNum1 = document.getElementById('train-num1');
  const trOp = document.getElementById('train-op');
  const trNum2 = document.getElementById('train-num2');
  const trBlank = document.getElementById('train-blank');
  
  const trMonsterBubble = document.getElementById('monster-bubble');
  const trWizardBubble = document.getElementById('wizard-bubble');
  const trChoices = document.getElementById('training-choices');
  const trGuideChain = document.getElementById('bubble-guide-chain');
  
  function setupTrainingMode() {
    trainingState.solvedCount = 0;
    trainingState.firstTry = true;
    generateTrainingQuestion();
  }
  
  // 랜덤 연습 문제 생성 (+9~+6, -9~-6)
  function generateTrainingQuestion() {
    trainingState.firstTry = true;
    trBlank.textContent = '?';
    trBlank.className = 'eq-blank';
    trGuideChain.innerHTML = '';
    
    // 문제 구성
    const isPlus = Math.random() < 0.5;
    const opVal = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
    
    let num1, answer;
    if (isPlus) {
      // 덧셈의 경우 결과가 99 이하가 되도록 설정
      num1 = Math.floor(Math.random() * 80) + 10; // 10 ~ 89
      answer = num1 + opVal;
    } else {
      // 뺄셈의 경우 결과가 1 이상이 되도록 설정
      num1 = Math.floor(Math.random() * 80) + 15; // 15 ~ 94
      answer = num1 - opVal;
    }
    
    trainingState.currentQuestion = {
      num1: num1,
      op: isPlus ? '+' : '-',
      num2: opVal,
      answer: answer
    };
    
    // UI 업데이트
    trNum1.textContent = num1;
    trOp.textContent = isPlus ? '+' : '-';
    trNum2.textContent = opVal;
    
    trMonsterBubble.textContent = `받아라! ${isPlus ? num1 + '에 ' + opVal + '을 더해봐!' : num1 + '에서 ' + opVal + '을 빼봐!'}`;
    trWizardBubble.textContent = `보수의 마법 콤보를 시전한다!`;
    
    // 마법 보수 가이드 애니메이션 체인 동작
    renderBubbleChainGuide(num1, isPlus, opVal);
    
    // 정답 및 오답 보기 선택지 배치
    generateTrainingChoices(answer);
  }
  
  // 콤보 애니메이션 가이드 렌더링
  function renderBubbleChainGuide(start, isPlus, val) {
    trGuideChain.innerHTML = '';
    
    // 1단계 노드: 시작 수
    const node1 = createGuideNode(start, 'start-node');
    trGuideChain.appendChild(node1);
    
    // 2단계: 십의 자리 이동 연산
    const op1 = isPlus ? '+10' : '-10';
    const num2Val = isPlus ? start + 10 : start - 10;
    
    setTimeout(() => {
      if (currentMode !== 'training') return;
      trGuideChain.appendChild(createGuideArrow());
      trGuideChain.appendChild(createGuideNode(op1, 'op-bubble'));
      
      // 마법사 리액션
      trWizardBubble.textContent = isPlus ? `우선 10을 더해봐! 십의 자리만 1 올라가니까 ${num2Val}!` : `우선 10을 빼봐! 십의 자리만 1 내려가니까 ${num2Val}!`;
    }, 700);
    
    // 3단계: 결과 수 10
    setTimeout(() => {
      if (currentMode !== 'training') return;
      trGuideChain.appendChild(createGuideArrow());
      trGuideChain.appendChild(createGuideNode(num2Val));
    }, 1400);
    
    // 4단계: 보정 연산 (+9인 경우 -1, -9인 경우 +1, +8은 -2 등)
    const backAmount = 10 - val;
    const op2 = isPlus ? `-${backAmount}` : `+${backAmount}`;
    const finalVal = isPlus ? num2Val - backAmount : num2Val + backAmount;
    
    setTimeout(() => {
      if (currentMode !== 'training') return;
      trGuideChain.appendChild(createGuideArrow());
      trGuideChain.appendChild(createGuideNode(op2, 'op-bubble'));
      
      trWizardBubble.textContent = isPlus 
        ? `9보다 10을 더 많이 더했으니 다시 ${backAmount}을 빼자! 그럼 ${finalVal}!` 
        : `9보다 10을 더 많이 뺐으니 다시 ${backAmount}을 더하자! 그럼 ${finalVal}!`;
    }, 2100);
    
    // 5단계: 최종 정답 노드
    setTimeout(() => {
      if (currentMode !== 'training') return;
      trGuideChain.appendChild(createGuideArrow());
      const finalNode = createGuideNode(finalVal, 'start-node');
      trGuideChain.appendChild(finalNode);
      
      trWizardBubble.textContent = `정답은 ${finalVal} 마법 장벽!`;
    }, 2800);
  }
  
  function createGuideNode(text, className = '') {
    const el = document.createElement('div');
    el.className = `guide-step-node ${className}`;
    el.textContent = text;
    return el;
  }
  
  function createGuideArrow() {
    const el = document.createElement('span');
    el.className = 'guide-step-arrow';
    el.innerHTML = '➔';
    return el;
  }
  
  // 3지 선다 선택지 생성
  function generateTrainingChoices(answer) {
    trChoices.innerHTML = '';
    
    const candidates = [answer];
    
    // 오답 생성 (중복 제거 및 1~99 범위 유지)
    while (candidates.length < 3) {
      const offset = [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)];
      const wrong = answer + offset;
      if (wrong >= 1 && wrong <= 99 && !candidates.includes(wrong)) {
        candidates.push(wrong);
      }
    }
    
    // 보기 셔플
    candidates.sort(() => Math.random() - 0.5);
    
    candidates.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice;
      
      const select = () => {
        checkTrainingAnswer(choice, btn);
      };
      
      btn.addEventListener('click', select);
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        select();
      });
      
      trChoices.appendChild(btn);
    });
  }
  
  function checkTrainingAnswer(selected, buttonEl) {
    const q = trainingState.currentQuestion;
    if (!q) return;
    
    if (selected === q.answer) {
      // 정답!
      buttonEl.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
      buttonEl.style.borderColor = '#2ecc71';
      
      trBlank.textContent = q.answer;
      trBlank.className = 'eq-blank correct';
      trBlank.style.color = '#2ecc71';
      
      trMonsterBubble.textContent = `크아악! 마법 콤보에 맞았다!`;
      trWizardBubble.textContent = `보수 공격 성공! 얍! 💫`;
      
      // 이펙트 및 정답 사운드 대체
      triggerConfetti();
      
      if (trainingState.firstTry) {
        // 첫 시도에 맞추면 콤보 및 점수 추가
        comboCount++;
        gameScore += 20;
        
        comboBadge.style.display = 'block';
        comboCountDisplay.textContent = comboCount;
      } else {
        gameScore += 10;
      }
      
      gameScoreDisplay.textContent = gameScore;
      trainingState.solvedCount++;
      
      // 5문제를 해결하면 스테이지 클리어
      if (trainingState.solvedCount >= trainingState.targetCount) {
        trainingState.activeTimeout = setTimeout(() => {
          showVictoryOverlay(`훌륭해요! 5개의 보수 트레이닝을 마스터하여 마법 별 1개를 획득했습니다!`, 1);
        }, 1500);
      } else {
        trainingState.activeTimeout = setTimeout(() => {
          generateTrainingQuestion();
        }, 1500);
      }
      
    } else {
      // 오답
      buttonEl.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
      buttonEl.style.borderColor = '#e74c3c';
      
      trainingState.firstTry = false;
      comboCount = 0;
      comboBadge.style.display = 'none';
      
      trMonsterBubble.textContent = `메롱! 틀렸지롱! 다시 계산해봐!`;
      
      // 친절한 가이드 힌트 구성
      const isPlus = q.op === '+';
      const back = 10 - q.num2;
      
      if (isPlus) {
        trWizardBubble.textContent = `💡 힌트: ${q.num1}에 10을 더해 20대 숫자를 만든 다음 ${back}을 빼봐!`;
      } else {
        trWizardBubble.textContent = `💡 힌트: ${q.num1}에서 10을 뺀 다음 10보다 덜 뺐으니 ${back}을 더해봐!`;
      }
    }
  }
  
  
  // ==========================================================================
  // 🛡️ [모드 3] 구십구 마법 장벽 실전 로직
  // ==========================================================================
  
  const btReshuffle = document.getElementById('btn-battle-reshuffle');
  const reshuffleCountDisp = document.getElementById('reshuffle-count');
  const handCardsContainer = document.getElementById('battle-hand-cards');
  const barrierGauge = document.getElementById('barrier-gauge');
  const barrierValue = document.getElementById('barrier-value');
  
  function setupBattleMode() {
    battleState.barrierVal = 50;
    battleState.reshuffleLeft = 3;
    gameScore = 0;
    
    reshuffleCountDisp.textContent = battleState.reshuffleLeft;
    btReshuffle.disabled = false;
    
    updateBarrierUI();
    generateBattleHand();
    
    // 리셔플 버튼 이벤트
    const triggerReshuffle = () => {
      if (battleState.reshuffleLeft <= 0) return;
      battleState.reshuffleLeft--;
      reshuffleCountDisp.textContent = battleState.reshuffleLeft;
      
      if (battleState.reshuffleLeft === 0) {
        btReshuffle.disabled = true;
      }
      
      generateBattleHand();
      triggerConfetti();
    };
    
    btReshuffle.cloneNode(true);
    const newReshuffle = btReshuffle.cloneNode(true);
    btReshuffle.parentNode.replaceChild(newReshuffle, btReshuffle);
    newReshuffle.addEventListener('click', triggerReshuffle);
    newReshuffle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      triggerReshuffle();
    });
  }
  
  // 3장 카드 생성
  function generateBattleHand() {
    battleState.hand = [];
    handCardsContainer.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
      const card = getRandomMagicCard();
      battleState.hand.push(card);
      renderMagicCard(card, i);
    }
  }
  
  // 단일 카드 획득 로직
  function getRandomMagicCard() {
    // 8세 타겟팅 연산 리스트: 10, 9, 8, 7, 6 묶음과 소폭 미세 조정을 위한 1, 2
    const operations = [
      { val: 10, txt: '+10', desc: '십의 자리만 1 올리기', color: '#27ae60' },
      { val: -10, txt: '-10', desc: '십의 자리만 1 내리기', color: '#16a085' },
      { val: 9, txt: '+9', desc: '10 더하고 1 빼기', color: '#e67e22' },
      { val: -9, txt: '-9', desc: '10 빼고 1 더하기', color: '#d35400' },
      { val: 8, txt: '+8', desc: '10 더하고 2 빼기', color: '#2980b9' },
      { val: -8, txt: '-8', desc: '10 빼고 2 더하기', color: '#3498db' },
      { val: 7, txt: '+7', desc: '10 더하고 3 빼기', color: '#8e44ad' },
      { val: -7, txt: '-7', desc: '10 빼고 3 더하기', color: '#9b59b6' },
      { val: 6, txt: '+6', desc: '10 더하고 4 빼기', color: '#4b4b7d' },
      { val: -6, txt: '-6', desc: '10 빼고 4 더하기', color: '#5b5b8d' },
      // 소규모 조정 카드
      { val: 1, txt: '+1', desc: '낱개 1칸 더하기', color: '#2ecc71' },
      { val: -1, txt: '-1', desc: '낱개 1칸 빼기', color: '#e74c3c' },
      { val: 2, txt: '+2', desc: '낱개 2칸 더하기', color: '#f1c40f' },
      { val: -2, txt: '-2', desc: '낱개 2칸 빼기', color: '#f39c12' }
    ];
    
    return operations[Math.floor(Math.random() * operations.length)];
  }
  
  // 마법 카드 렌더링
  function renderMagicCard(card, index) {
    const cardEl = document.createElement('div');
    cardEl.className = 'magic-card';
    cardEl.style.borderColor = card.color;
    
    cardEl.innerHTML = `
      <div class="card-icon">🔮</div>
      <div class="card-value" style="color: ${card.color}">${card.txt}</div>
      <div class="card-desc">${card.desc}</div>
    `;
    
    const play = () => {
      playMagicCard(card, index);
    };
    
    cardEl.addEventListener('click', play);
    cardEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      play();
    });
    
    handCardsContainer.appendChild(cardEl);
  }
  
  // 카드 선택 시 연산 적용
  function playMagicCard(card, index) {
    const nextVal = battleState.barrierVal + card.val;
    
    if (nextVal < 0 || nextVal > 99) {
      // 0~99 범위를 벗어나 게임오버
      battleState.barrierVal = nextVal;
      updateBarrierUI();
      
      // 폭발 연출을 위한 빨간 폰트
      barrierValue.style.color = '#ff7675';
      barrierValue.style.textShadow = '0 0 20px #ff7675';
      
      setTimeout(() => {
        showGameoverOverlay();
      }, 800);
      
    } else {
      // 합격! 연산 적용
      battleState.barrierVal = nextVal;
      updateBarrierUI();
      
      // 점수 업데이트
      gameScore += 10;
      gameScoreDisplay.textContent = gameScore;
      
      // 100점 획득 시 마법 별 제공
      if (gameScore % 100 === 0) {
        gainTrophy();
      }
      
      // 해당 카드를 새로 보충
      const newCard = getRandomMagicCard();
      battleState.hand[index] = newCard;
      
      // 카드 목록 다시 렌더링
      refreshHandCardsUI();
      
      // 스파클 폭죽 미세 연출
      triggerConfetti(15);
    }
  }
  
  function refreshHandCardsUI() {
    handCardsContainer.innerHTML = '';
    battleState.hand.forEach((card, i) => {
      renderMagicCard(card, i);
    });
  }
  
  function updateBarrierUI() {
    const val = battleState.barrierVal;
    barrierValue.textContent = val;
    
    // 수치 99 클램핑 반영
    const clampedPercent = Math.max(0, Math.min(100, (val / 99) * 100));
    barrierGauge.style.width = `${clampedPercent}%`;
    
    // 게이지 색상 변경 (안정 상태에 따라)
    if (val >= 90 || val <= 10) {
      barrierGauge.style.background = 'linear-gradient(90deg, #ff7675, #d63031)'; // 경고 (빨간색)
      barrierValue.style.color = '#ff7675';
    } else if (val >= 75 || val <= 25) {
      barrierGauge.style.background = 'linear-gradient(90deg, #ffeaa7, #fdcb6e)'; // 조심 (노란색)
      barrierValue.style.color = '#fdcb6e';
    } else {
      barrierGauge.style.background = 'linear-gradient(90deg, #55efc4, #00b894)'; // 안정 (초록색)
      barrierValue.style.color = '#fff';
    }
  }
  
  
  // ==========================================================================
  // 🏆 보상 및 팝업 제어
  // ==========================================================================
  
  function gainTrophy() {
    trophyCount++;
    localStorage.setItem('mathcraft_g2_trophies', trophyCount);
    trophyCountDisplay.textContent = trophyCount;
  }
  
  function showVictoryOverlay(descText, starGain = 1) {
    for (let i = 0; i < starGain; i++) {
      gainTrophy();
    }
    
    const title = document.getElementById('victory-title');
    const desc = document.getElementById('victory-desc');
    
    title.textContent = '수련 스테이지 클리어!';
    desc.innerHTML = `${descText}<br><span style="color:#ffd700; font-size:22px; font-weight:bold;">별을 ${starGain}개 획득했습니다! ⭐️</span>`;
    
    victoryOverlay.classList.add('active');
    triggerConfetti(120);
  }
  
  function showGameoverOverlay() {
    finalScoreDisplay.textContent = gameScore;
    gameoverOverlay.classList.add('active');
  }
  
  
  // ==========================================================================
  // 🎉 Canvas 기반 꽃가루 파티클 효과 (Confetti Effect)
  // ==========================================================================
  
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  
  let confettiActive = false;
  let particles = [];
  const colors = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#ff7675', '#74b9ff'];
  
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class ConfettiParticle {
    constructor(x, y, count) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      // 발사 벡터
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + (count > 50 ? 5 : 2);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (count > 50 ? 4 : 2);
      
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
      this.gravity = 0.15;
      this.opacity = 1.0;
    }
    
    update() {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.opacity -= 0.015;
    }
    
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }
  
  function triggerConfetti(count = 100) {
    resizeCanvas();
    const startX = canvas.width / 2;
    const startY = canvas.height * 0.4;
    
    for (let i = 0; i < count; i++) {
      particles.push(new ConfettiParticle(
        startX + (Math.random() * 100 - 50),
        startY + (Math.random() * 60 - 30),
        count
      ));
    }
    
    if (!confettiActive) {
      confettiActive = true;
      animateConfetti();
    }
  }
  
  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, idx) => {
      p.update();
      p.draw();
      
      // 화면 밑으로 떨어지거나 투명해진 파티클 필터
      if (p.y > canvas.height || p.opacity <= 0) {
        particles.splice(idx, 1);
      }
    });
    
    if (particles.length > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiActive = false;
    }
  }
  
});
