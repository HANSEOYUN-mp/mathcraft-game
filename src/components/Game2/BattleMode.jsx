import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  { val: 1, txt: '+1', desc: '낱개 1칸 더하기', color: '#2ecc71' },
  { val: -1, txt: '-1', desc: '낱개 1칸 빼기', color: '#e74c3c' },
  { val: 2, txt: '+2', desc: '낱개 2칸 더하기', color: '#f1c40f' },
  { val: -2, txt: '-2', desc: '낱개 2칸 빼기', color: '#f39c12' }
];

function getRandomMagicCard() {
  return operations[Math.floor(Math.random() * operations.length)];
}

function BattleMode({ onBack, addTrophy, triggerConfetti, score, setScore }) {
  const [barrierVal, setBarrierVal] = useState(50);
  const [hand, setHand] = useState([]);
  const [reshuffleLeft, setReshuffleLeft] = useState(3);
  const [gameResult, setGameResult] = useState(null); // null | 'gameover'

  const generateHand = () => {
    const list = [getRandomMagicCard(), getRandomMagicCard(), getRandomMagicCard()];
    setHand(list);
  };

  useEffect(() => {
    generateHand();
    setScore(0);
  }, []);

  const handlePlayCard = (card, idx) => {
    if (gameResult) return;
    const nextVal = barrierVal + card.val;

    if (nextVal < 0 || nextVal > 99) {
      setBarrierVal(nextVal);
      setGameResult('gameover');
    } else {
      setBarrierVal(nextVal);
      
      setScore(prev => {
        const next = prev + 10;
        if (next % 100 === 0) {
          addTrophy(1);
          triggerConfetti();
        }
        return next;
      });

      // Refill card
      setHand(prev => {
        const next = [...prev];
        next[idx] = getRandomMagicCard();
        return next;
      });
    }
  };

  const handleReshuffle = () => {
    if (reshuffleLeft <= 0 || gameResult) return;
    setReshuffleLeft(prev => prev - 1);
    generateHand();
    triggerConfetti();
  };

  const resetGame = () => {
    setBarrierVal(50);
    setReshuffleLeft(3);
    setGameResult(null);
    setScore(0);
    generateHand();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 max-w-4xl w-full mx-auto relative">
      {/* Header HUD */}
      <div className="w-full flex justify-between items-center mb-4 z-10">
        <button 
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 font-bold text-xs transition-all"
        >
          ⚙️ 모드선택
        </button>
        <div className="text-center">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">실전 모드</span>
          <h3 className="text-lg font-black text-purple-400">🛡️ 구십구 마법 장벽</h3>
        </div>
        <div className="bg-slate-800 px-2.5 py-1.5 rounded-lg text-emerald-400 font-bold text-xs">
          💯 점수: {score}
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 z-10">
        
        {/* Barrier Hud */}
        <div className="w-full bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-3 shadow-2xl">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-200">🛡️ 마법 장벽 안정도</h4>
            <span className="text-[10px] text-rose-300 font-nanum">수치가 99를 넘거나 0 미만이 되면 장벽이 폭발해요!</span>
          </div>
          
          {/* Gauge Bar */}
          <div className="h-12 bg-slate-950 rounded-xl overflow-hidden border border-white/10 relative flex items-center justify-center">
            <motion.div 
              animate={{ width: `${Math.max(0, Math.min(100, barrierVal))}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className={`absolute left-0 top-0 bottom-0 ${
                barrierVal > 85 || barrierVal < 15 
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[inset_0_0_15px_rgba(244,63,94,0.5)]' 
                  : barrierVal > 70 || barrierVal < 30 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 shadow-[inset_0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-700 shadow-[inset_0_0_15px_rgba(99,102,241,0.5)]'
              }`}
            />
            <span className="text-2xl font-black z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              {barrierVal}
            </span>
          </div>
        </div>

        {/* Hand Cards */}
        {gameResult === null && (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-200">🔮 내 마법 카드</h4>
              <button
                disabled={reshuffleLeft <= 0}
                onClick={handleReshuffle}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 px-3 py-1 rounded-xl text-[10px] font-bold text-indigo-300 transition-all"
              >
                🔄 카드 셔플 ({reshuffleLeft}회 남음)
              </button>
            </div>

            {/* Hand list */}
            <div className="grid grid-cols-3 gap-3">
              {hand.map((card, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlayCard(card, idx)}
                  style={{ borderColor: card.color + '40' }}
                  className="cursor-pointer bg-slate-900/60 backdrop-blur-md rounded-xl p-3 border-2 hover:border-indigo-500/50 flex flex-col items-center justify-between text-center min-h-[120px] shadow-lg transition-all group"
                >
                  <span className="text-3xl group-hover:animate-bounce mb-1">🔮</span>
                  <span 
                    style={{ color: card.color }}
                    className="text-2xl font-black tracking-wider"
                  >
                    {card.txt}
                  </span>
                  <span className="text-slate-400 text-[10px] font-nanum leading-relaxed mt-1">
                    {card.desc}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameResult && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
            <div className="text-6xl animate-pulse">💥</div>
            <h3 className="text-2xl font-black text-rose-500">장벽 대폭발!</h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-md">
              수치가 한계를 넘어서 장벽이 폭발했습니다! (최종 점수: {score}점)
            </p>
            <div className="flex gap-3">
              <button 
                onClick={resetGame}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg text-lg"
              >
                🔄 다시 도전하기
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

export default BattleMode;
