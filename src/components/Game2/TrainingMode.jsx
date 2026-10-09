import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TrainingMode({ onBack, addTrophy, triggerConfetti, score, setScore }) {
  const [wizardHP, setWizardHP] = useState(3);
  const [monsterHP, setMonsterHP] = useState(3);
  const [currentStep, setCurrentStep] = useState(1);
  const [questionType, setQuestionType] = useState('combo');
  const [timeLeft, setTimeLeft] = useState(10);
  const [originalNum, setOriginalNum] = useState(0);
  const [operator, setOperator] = useState('+');
  const [operand, setOperand] = useState(9);
  const [correctStepAnswer, setCorrectStepAnswer] = useState(0);
  const [tempResult, setTempResult] = useState(0);
  const [choices, setChoices] = useState([]);
  
  // Custom states for single-step blank complementing
  const [helperStep2Op, setHelperStep2Op] = useState('+');
  const [helperStep2Val, setHelperStep2Val] = useState(1);
  const [finalResult, setFinalResult] = useState(0);
  const [blankType, setBlankType] = useState('step1'); // 'step1' | 'step2'
  
  // Animation states
  const [isCannonFiring, setIsCannonFiring] = useState('none'); // 'none' | 'wizard' | 'monster'
  const [isExploding, setIsExploding] = useState(false);
  const [explosionCoords, setExplosionCoords] = useState({ left: '0px', top: '0px' });
  const [wizardShake, setWizardShake] = useState(false);
  const [monsterShake, setMonsterShake] = useState(false);
  const [wizardCannonShoot, setWizardCannonShoot] = useState(false);
  const [monsterCannonShoot, setMonsterCannonShoot] = useState(false);

  // Speech bubble states
  const [wizardBubbleText, setWizardBubbleText] = useState('보수 마법 준비! 🧙‍♂️');
  const [wizardBubbleActive, setWizardBubbleActive] = useState(true);
  const [monsterBubbleText, setMonsterBubbleText] = useState('대포로 날려주마! 😈');
  const [monsterBubbleActive, setMonsterBubbleActive] = useState(true);
  
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [gameResult, setGameResult] = useState(null); // null | 'victory' | 'gameover'
  const [localCombo, setLocalCombo] = useState(0);

  const timerRef = useRef(null);
  const bubbleTimerWizard = useRef(null);
  const bubbleTimerMonster = useRef(null);

  const showBubble = (side, text, duration = 3000) => {
    if (side === 'wizard') {
      setWizardBubbleText(text);
      setWizardBubbleActive(true);
      if (bubbleTimerWizard.current) clearTimeout(bubbleTimerWizard.current);
      if (duration > 0) {
        bubbleTimerWizard.current = setTimeout(() => setWizardBubbleActive(false), duration);
      }
    } else {
      setMonsterBubbleText(text);
      setMonsterBubbleActive(true);
      if (bubbleTimerMonster.current) clearTimeout(bubbleTimerMonster.current);
      if (duration > 0) {
        bubbleTimerMonster.current = setTimeout(() => setMonsterBubbleActive(false), duration);
      }
    }
  };

  // Timer loop
  useEffect(() => {
    if (gameResult) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          handleStepTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [correctStepAnswer, gameResult]);

  useEffect(() => {
    // Initial start
    setupNewQuestion();
    return () => {
      if (bubbleTimerWizard.current) clearTimeout(bubbleTimerWizard.current);
      if (bubbleTimerMonster.current) clearTimeout(bubbleTimerMonster.current);
    };
  }, []);

  const handleStepTimeout = () => {
    setButtonsDisabled(true);
    showBubble('monster', '시간 초과다! 받아라! 😈');
    showBubble('wizard', '아앗! 시간이 없어! 🧙‍♂️');
    fireCannon('monster');
  };

  const setupNewQuestion = (currentWHP = wizardHP, currentMHP = monsterHP) => {
    setButtonsDisabled(false);
    
    // Check game over / victory
    if (currentWHP <= 0) {
      setGameResult('gameover');
      return;
    }
    if (currentMHP <= 0) {
      setGameResult('victory');
      addTrophy(1);
      triggerConfetti();
      return;
    }

    const isCombo = Math.random() < 0.6;
    const type = isCombo ? 'combo' : 'direct';
    setQuestionType(type);
    setCurrentStep(1);
    setTimeLeft(10);

    if (type === 'direct') {
      const isPlus = Math.random() < 0.5;
      const op = isPlus ? '+' : '-';
      setOperator(op);
      setOperand(10);
      
      let startNum, ansVal;
      if (isPlus) {
        startNum = Math.floor(Math.random() * 90); // 0 ~ 89
        ansVal = startNum + 10;
      } else {
        startNum = Math.floor(Math.random() * 90) + 10; // 10 ~ 99
        ansVal = startNum - 10;
      }
      
      setOriginalNum(startNum);
      setFinalResult(ansVal);
      setBlankType('step1'); // always step1 for direct
      setCorrectStepAnswer(10);
      generateChoices(10);
      
      showBubble('monster', `${startNum} ${op} 10 = ?`, 0);
    } else {
      const isPlus = Math.random() < 0.5;
      const op = isPlus ? '+' : '-';
      const operandVal = Math.random() < 0.5 ? 9 : 8;
      setOperator(op);
      setOperand(operandVal);
      
      let startNum, finalAns;
      if (isPlus) {
        startNum = Math.floor(Math.random() * (100 - operandVal)); 
        finalAns = startNum + operandVal;
      } else {
        startNum = Math.floor(Math.random() * (100 - operandVal)) + operandVal;
        finalAns = startNum - operandVal;
      }
      
      const correctionAmount = 10 - operandVal;
      const correctionOp = isPlus ? '-' : '+';
      const bType = Math.random() < 0.5 ? 'step1' : 'step2';
      
      setOriginalNum(startNum);
      setHelperStep2Op(correctionOp);
      setHelperStep2Val(correctionAmount);
      setFinalResult(finalAns);
      setBlankType(bType);
      
      const stepAns = bType === 'step1' ? 10 : correctionAmount;
      setCorrectStepAnswer(stepAns);
      generateChoices(stepAns);
      
      showBubble('monster', `${startNum} ${op} ${operandVal} = ?`, 0);
    }
  };

  const generateChoices = (ans) => {
    const list = [ans];
    if (ans === 10) {
      const pool = [5, 8, 9, 12, 15];
      while (list.length < 3) {
        const candidate = pool[Math.floor(Math.random() * pool.length)];
        if (!list.includes(candidate)) {
          list.push(candidate);
        }
      }
    } else {
      const pool = [1, 2, 3, 4, 5];
      while (list.length < 3) {
        const candidate = pool[Math.floor(Math.random() * pool.length)];
        if (!list.includes(candidate)) {
          list.push(candidate);
        }
      }
    }
    list.sort(() => Math.random() - 0.5);
    setChoices(list);
  };

  const handleSelectAnswer = (choice) => {
    if (buttonsDisabled) return;
    setButtonsDisabled(true);
    
    if (timerRef.current) clearInterval(timerRef.current);

    if (choice === correctStepAnswer) {
      // Correct!
      showBubble('wizard', '정답이다! 마법 대포 발사! 🧙‍♂️', 3000);
      showBubble('monster', '으아악! 😈', 3000);
      fireCannon('wizard');
    } else {
      // Wrong!
      showBubble('monster', '낄낄! 틀렸구나! 대포 발사! 😈', 3000);
      showBubble('wizard', '으아악! 잘못 계산했어! 🧙‍♂️', 3000);
      fireCannon('monster');
    }
  };

  const fireCannon = (attacker) => {
    const isWizard = attacker === 'wizard';
    
    // Trigger cannon animation recoil
    if (isWizard) setWizardCannonShoot(true);
    else setMonsterCannonShoot(true);
    
    setTimeout(() => {
      setWizardCannonShoot(false);
      setMonsterCannonShoot(false);
    }, 400);

    // Fire bullet
    setIsCannonFiring(attacker);

    // After 800ms, impact!
    setTimeout(() => {
      setIsCannonFiring('none');
      
      // Explosion Coords
      const left = isWizard ? '80px' : 'calc(100% - 90px)';
      setExplosionCoords({ left, top: '85px' });
      setIsExploding(true);
      setTimeout(() => setIsExploding(false), 500);

      // Target shake and HP change
      let nextWHP = wizardHP;
      let nextMHP = monsterHP;
      if (isWizard) {
        setMonsterShake(true);
        setTimeout(() => setMonsterShake(false), 500);
        
        nextMHP = Math.max(0, monsterHP - 1);
        setMonsterHP(nextMHP);
        setLocalCombo(prev => prev + 1);
        setScore(prev => prev + 20);
        triggerConfetti();
      } else {
        setWizardShake(true);
        setTimeout(() => setWizardShake(false), 500);
        
        nextWHP = Math.max(0, wizardHP - 1);
        setWizardHP(nextWHP);
        setLocalCombo(0);
      }

      // Transition to next question
      setTimeout(() => {
        setupNewQuestion(nextWHP, nextMHP);
      }, 1500);

    }, 800);
  };

  const resetGame = () => {
    setWizardHP(3);
    setMonsterHP(3);
    setGameResult(null);
    setLocalCombo(0);
    setTimeout(() => {
      setupNewQuestion(3, 3);
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 max-w-5xl w-full mx-auto relative">
      {/* Header HUD */}
      <div className="w-full flex justify-between items-center mb-3 z-10">
        <button 
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 font-bold text-xs transition-all"
        >
          ⚙️ 모드선택
        </button>
        <div className="text-center">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">학습 모드</span>
          <h3 className="text-lg font-black text-fuchsia-400">⚡ 마법사의 보수 트레이닝</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          {localCombo > 0 && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-md animate-bounce text-[10px]">
              🔥 {localCombo} 콤보!
            </div>
          )}
          <div className="bg-slate-800 px-2.5 py-1 rounded-lg text-emerald-400">💯 점수: {score}</div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 z-10">
        
        {/* ⏱️ 10초 타이머 */}
        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md p-2 rounded-xl border border-white/10 w-full">
          <span className="text-lg">⏳</span>
          <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/10 relative">
            <motion.div 
              animate={{ width: `${(timeLeft / 10) * 100}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              className={`h-full rounded-full bg-gradient-to-r ${
                timeLeft > 5 
                  ? 'from-emerald-400 to-green-500' 
                  : timeLeft > 2 
                    ? 'from-yellow-400 to-orange-500' 
                    : 'from-red-500 to-rose-600'
              }`}
            />
          </div>
          <span className="text-xs font-bold font-nanum text-slate-300 w-10 text-right">
            {Math.ceil(timeLeft)}초
          </span>
        </div>

        {/* ⚔️ Cannon Battle Stage */}
        <div className="h-[120px] w-full bg-gradient-to-b from-sky-500/10 to-sky-500/0 border border-white/10 rounded-2xl p-2.5 flex justify-between items-end relative overflow-hidden">
          
          {/* Left Monster Side */}
          <motion.div 
            animate={monsterShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            className="flex flex-col items-center w-[100px] relative z-10"
          >
            <div className="text-xs text-rose-400 mb-1 tracking-wide font-black">
              {'❤️'.repeat(monsterHP) || '💀'}
            </div>
            
            {/* Monster Bubble */}
            <AnimatePresence>
              {monsterBubbleActive && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute top-[-55px] bg-white text-slate-900 text-[10px] px-2 py-1 rounded-xl font-bold shadow-lg whitespace-nowrap after:content-[''] after:absolute after:bottom-[-6px] after:left-6 after:border-[6px] after:border-t-white after:border-r-transparent after:border-l-transparent after:border-b-transparent z-20"
                >
                  {monsterBubbleText}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 border border-red-900 flex items-center justify-center text-3xl shadow-lg relative z-10">
                😈
              </div>
              <div className="w-16 h-4 bg-red-800 border border-red-900 rounded-t-md -mt-0.5 relative z-0" />
              
              {/* Monster Cannon */}
              <motion.div 
                animate={monsterCannonShoot ? { x: -8, scaleX: -1 } : { scaleX: -1 }}
                className="absolute bottom-1 right-[-8px] text-xl z-20"
              >
                💥
              </motion.div>
            </div>
          </motion.div>

          {/* Bullet Projectile path */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <AnimatePresence>
              {isCannonFiring === 'wizard' && (
                <motion.div
                  initial={{ left: 'calc(100% - 90px)', top: '85px', scale: 1 }}
                  animate={{ 
                    left: ['calc(100% - 90px)', '50%', '75px'], 
                    top: ['85px', '15px', '85px'],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_#74b9ff,0_0_3px_#fff]"
                />
              )}
              {isCannonFiring === 'monster' && (
                <motion.div
                  initial={{ left: '75px', top: '85px', scale: 1 }}
                  animate={{ 
                    left: ['75px', '50%', 'calc(100% - 90px)'], 
                    top: ['85px', '15px', '85px'],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute w-5 h-5 rounded-full bg-gradient-to-r from-yellow-300 to-orange-500 shadow-[0_0_12px_#e17055,0_0_3px_#fff]"
                />
              )}
            </AnimatePresence>

            {/* Explosion */}
            <AnimatePresence>
              {isExploding && (
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 1.8, opacity: [1, 1, 0] }}
                  style={{ left: explosionCoords.left, top: explosionCoords.top }}
                  className="absolute text-4xl origin-center -translate-x-1/2 -translate-y-1/2"
                >
                  💥
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Wizard Side */}
          <motion.div 
            animate={wizardShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            className="flex flex-col items-center w-[100px] relative z-10"
          >
            <div className="text-xs text-rose-400 mb-1 tracking-wide font-black">
              {'❤️'.repeat(wizardHP) || '💀'}
            </div>
            
            {/* Wizard Bubble */}
            <AnimatePresence>
              {wizardBubbleActive && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute top-[-55px] bg-white text-slate-900 text-[10px] px-2 py-1 rounded-xl font-bold shadow-lg whitespace-nowrap after:content-[''] after:absolute after:bottom-[-6px] after:right-6 after:border-[6px] after:border-t-white after:border-r-transparent after:border-l-transparent after:border-b-transparent z-20"
                >
                  {wizardBubbleText}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-900 flex items-center justify-center text-3xl shadow-lg relative z-10">
                🧙‍♂️
              </div>
              <div className="w-16 h-4 bg-indigo-800 border border-indigo-900 rounded-t-md -mt-0.5 relative z-0" />
              
              {/* Wizard Cannon */}
              <motion.div 
                animate={wizardCannonShoot ? { x: 8 } : {}}
                className="absolute bottom-1 left-[-8px] text-xl z-20"
              >
                ⚡
              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* 📝 Quiz Section */}
        {gameResult === null && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col items-center gap-3 relative">
            
            {/* Helper Hint */}
            <div className="bg-white/5 border-l-4 border-yellow-400 p-2.5 rounded-lg w-full text-[11px] font-nanum leading-relaxed text-indigo-200 text-left">
              {questionType === 'direct' ? (
                operator === '+' 
                  ? `💡 힌트: ${originalNum}에 10을 더해봐요! 십의 자리 숫자가 1 커져요!`
                  : `💡 힌트: ${originalNum}에서 10을 빼봐요! 십의 자리 숫자가 1 작아져요!`
              ) : (
                blankType === 'step1' 
                  ? `💡 힌트: ${originalNum} ${operator} ${operand}를 쉽게 계산하기 위해 먼저 10을 ${operator === '+' ? '더해야' : '빼야'} 할까요?`
                  : `💡 힌트: 10을 ${operator === '+' ? '더해서' : '빼서'} 생긴 오차만큼 다시 ${helperStep2Op === '+' ? '더해주거나' : '빼주어야'} 해요!`
              )}
            </div>

            {/* Problem Equations */}
            <div className="flex flex-col items-center mt-1 w-full">
              <div className="bg-slate-950/80 px-4 py-1.5 rounded-lg text-yellow-300 font-bold border border-white/5 text-sm">
                문제 해결을 위해 네모 칸에 들어갈 숫자를 구해보세요!
              </div>
              
              <div className="flex items-center gap-2.5 text-2.5xl font-black mt-3 tracking-wider">
                {questionType === 'direct' ? (
                  <>
                    <span>{originalNum}</span>
                    <span className="text-indigo-400">{operator}</span>
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-yellow-300 text-xl font-black shadow-inner shadow-indigo-500/10">
                      ?
                    </div>
                    <span>=</span>
                    <span className="text-indigo-300">{finalResult}</span>
                  </>
                ) : (
                  blankType === 'step1' ? (
                    <>
                      <span>{originalNum}</span>
                      <span className="text-indigo-400">{operator}</span>
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-yellow-300 text-xl font-black shadow-inner shadow-indigo-500/10">
                        ?
                      </div>
                      <span className="text-indigo-400">{helperStep2Op}</span>
                      <span>{helperStep2Val}</span>
                      <span>=</span>
                      <span className="text-indigo-300">{finalResult}</span>
                    </>
                  ) : (
                    <>
                      <span>{originalNum}</span>
                      <span className="text-indigo-400">{operator}</span>
                      <span>10</span>
                      <span className="text-indigo-400">{helperStep2Op}</span>
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-yellow-300 text-xl font-black shadow-inner shadow-indigo-500/10">
                        ?
                      </div>
                      <span>=</span>
                      <span className="text-indigo-300">{finalResult}</span>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Choices Grid */}
            <div className="grid grid-cols-3 gap-3 w-full mt-2">
              {choices.map(choice => (
                <button
                  key={choice}
                  disabled={buttonsDisabled}
                  onClick={() => handleSelectAnswer(choice)}
                  className="bg-gradient-to-b from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 disabled:opacity-50 text-white border border-white/10 font-bold py-2.5 rounded-xl text-2xl shadow-lg transition-all"
                >
                  {choice}
                </button>
              ))}
            </div>

          </div>
        )}

        {/* 🏆 Game Over / Victory Overlay */}
        {gameResult && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[220px]">
            {gameResult === 'victory' ? (
              <>
                <div className="text-7xl animate-bounce">🏆</div>
                <h3 className="text-3xl font-black text-yellow-300">수련 스테이지 클리어!</h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                  훌륭해요! 몬스터 성을 멋지게 날려버리고 마법 별 1개를 획득했습니다! ⭐️
                </p>
              </>
            ) : (
              <>
                <div className="text-7xl animate-pulse">💀</div>
                <h3 className="text-3xl font-black text-rose-500">배틀 패배!</h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                  마법사의 성이 부서졌어요! 다시 보수 마법 공식을 차근차근 훈련해 볼까요?
                </p>
              </>
            )}
            <div className="flex gap-4">
              <button 
                onClick={resetGame}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg text-lg"
              >
                🔄 다시 배틀하기
              </button>
              <button 
                onClick={onBack}
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-bold transition-all text-lg"
              >
                ⚙️ 모드 선택
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default TrainingMode;
