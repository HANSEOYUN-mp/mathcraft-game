import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ElevatorMode({ onBack, addTrophy, triggerConfetti, score, setScore }) {
  const [currentNum, setCurrentNum] = useState(15);
  const [missionNum, setMissionNum] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [mathGuide, setMathGuide] = useState("마법의 엘리베이터에 탑승했습니다! 십의 자리 단추를 눌러 이동해 보세요.");
  const [highlightedPath, setHighlightedPath] = useState([]);

  // Generate new mission
  const generateNewMission = (current) => {
    let rand;
    do {
      rand = Math.floor(Math.random() * 98) + 1; // 1 ~ 98
    } while (rand === current);
    setMissionNum(rand);
  };

  useEffect(() => {
    generateNewMission(currentNum);
  }, []);

  const moveElevator = (diff) => {
    if (isMoving) return;
    const targetNum = currentNum + diff;

    // Boundary check
    if (targetNum < 1 || targetNum > 99) {
      setMathGuide(`⚠️ ${targetNum}층은 마법 격자판 범위를 벗어납니다! 이동할 수 없어요.`);
      return;
    }

    setIsMoving(true);
    const absDiff = Math.abs(diff);

    if (absDiff === 10) {
      // Direct move
      setHighlightedPath([]);
      setCurrentNum(targetNum);
      const text = diff > 0 
        ? `🔥 ${currentNum}에서 +10! 십의 자리가 1 늘어나 바로 아래층(${targetNum})으로 1칸 내려왔어요!` 
        : `🔥 ${currentNum}에서 -10! 십의 자리가 1 줄어들어 바로 위층(${targetNum})으로 1칸 올라갔어요!`;
      setMathGuide(text);
      checkMissionReach(targetNum);
    } else {
      // Complement move (e.g. +9 => +10 then -1)
      const tenDiff = diff > 0 ? 10 : -10;
      const step1 = currentNum + tenDiff;
      const backAmount = Math.abs(tenDiff) - absDiff;
      const backSign = diff > 0 ? '-' : '+';

      // 1. Move to step 1 (+10 or -10)
      setHighlightedPath([step1]);
      setCurrentNum(step1);
      setMathGuide(
        diff > 0
          ? `🪄 ${currentNum}에서 +${absDiff}의 마법!<br/>1단계: 먼저 <b>10</b>을 더해서 <b>${step1}</b>로 가고...`
          : `🪄 ${currentNum}에서 -${absDiff}의 마법!<br/>1단계: 먼저 <b>10</b>을 빼서 <b>${step1}</b>로 가고...`
      );

      // 2. Adjust after 700ms
      setTimeout(() => {
        setHighlightedPath([targetNum]);
        setCurrentNum(targetNum);
        setMathGuide(prev => 
          prev + (diff > 0
            ? `<br/>2단계: 너무 많이 갔으니 다시 <b>${backAmount}</b>을 빼서(<b>${backSign}${backAmount}</b>) 최종 <b>${targetNum}</b>에 도착!`
            : `<br/>2단계: 너무 많이 뺐으니 다시 <b>${backAmount}</b>을 더해서(<b>${backSign}${backAmount}</b>) 최종 <b>${targetNum}</b>에 도착!`)
        );
        checkMissionReach(targetNum);
      }, 700);
    }
  };

  const checkMissionReach = (num) => {
    if (num === missionNum) {
      setTimeout(() => {
        triggerConfetti();
        setScore(prev => {
          const next = prev + 20;
          if (next % 100 === 0) {
            addTrophy(1);
          }
          return next;
        });
        
        setMathGuide(prev => prev + `<br/><br/><span class="text-yellow-300 font-bold text-lg">🎉 미션 성공! 별의 에너지를 얻었습니다! (+20점)</span>`);
        generateNewMission(num);
        setIsMoving(false);
      }, 800);
    } else {
      setTimeout(() => {
        setIsMoving(false);
      }, 800);
    }
  };

  const cells = Array.from({ length: 99 }, (_, i) => i + 1);

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
          <h3 className="text-lg font-black text-indigo-400">🛗 10층 숫자 엘리베이터</h3>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          <div className="bg-slate-800 px-2.5 py-1 rounded-lg text-emerald-400">💯 점수: {score}</div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch z-10">
        {/* Left 10x10 Grid Panel */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-center">
          <div className="grid grid-cols-10 gap-1 bg-slate-950 p-1.5 rounded-xl relative">
            {cells.map(num => {
              const isCurrent = currentNum === num;
              const isMission = missionNum === num;
              const isHighlighted = highlightedPath.includes(num);

              return (
                <div 
                  key={num} 
                  className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-md relative transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
                      : isMission 
                        ? 'border-2 border-yellow-400 bg-yellow-400/10 text-yellow-300 animate-pulse' 
                        : isHighlighted 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-white/5 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  {num}
                  {isCurrent && (
                    <motion.div 
                      layoutId="wizardToken" 
                      className="absolute inset-0 flex items-center justify-center text-xl z-10 pointer-events-none"
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    >
                      🧙‍♂️
                    </motion.div>
                  )}
                </div>
              );
            })}
            <div className="aspect-square flex items-center justify-center bg-white/5 text-slate-600 rounded-md opacity-40 text-[10px]">
              🔒
            </div>
          </div>
        </div>

        {/* Right Controls Panel */}
        <div className="bg-slate-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="text-slate-400 text-[10px] font-bold block mb-0.5">현재 내 층수</span>
              <span className="text-3xl font-black text-indigo-400">{currentNum}층</span>
            </div>

            <div className="bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/20 min-h-[85px] flex items-center justify-center text-center">
              <p 
                className="text-indigo-200 text-xs font-nanum leading-relaxed"
                dangerouslySetInnerHTML={{ __html: mathGuide }}
              />
            </div>
          </div>

          {/* Controls buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="bg-white/5 p-2 rounded-xl flex flex-col gap-1 border border-white/5">
              <span className="text-slate-400 text-[10px] font-bold text-center block mb-0.5">십의 자리 이동 (10칸)</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  disabled={isMoving}
                  onClick={() => moveElevator(10)}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition-all"
                >
                  +10 (아래로)
                </button>
                <button 
                  disabled={isMoving}
                  onClick={() => moveElevator(-10)}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition-all"
                >
                  -10 (위로)
                </button>
              </div>
            </div>

            <div className="bg-white/5 p-2 rounded-xl flex flex-col gap-1 border border-white/5">
              <span className="text-slate-400 text-[10px] font-bold text-center block mb-0.5">9의 마법 (10 가감 후 1 보정)</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  disabled={isMoving}
                  onClick={() => moveElevator(9)}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition-all"
                >
                  +9 (아래1, 왼1)
                </button>
                <button 
                  disabled={isMoving}
                  onClick={() => moveElevator(-9)}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition-all"
                >
                  -9 (위1, 오1)
                </button>
              </div>
            </div>

            <div className="bg-white/5 p-2 rounded-xl flex flex-col gap-1 border border-white/5">
              <span className="text-slate-400 text-[10px] font-bold text-center block mb-0.5">8의 마법 (10 가감 후 2 보정)</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  disabled={isMoving}
                  onClick={() => moveElevator(8)}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition-all"
                >
                  +8
                </button>
                <button 
                  disabled={isMoving}
                  onClick={() => moveElevator(-8)}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition-all"
                >
                  -8
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ElevatorMode;
