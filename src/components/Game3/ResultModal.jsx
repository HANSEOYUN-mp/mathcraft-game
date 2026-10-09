import React from 'react';
import { motion } from 'framer-motion';

function ResultModal({ stats, onRestart, onExit }) {
  const { cpm = 0, maxCpm = 0, accuracy = 100, elapsedTime = 0, earnedStars = 1, modeName = '연습' } = stats;

  let grade = 'B';
  let gradeColor = 'text-blue-400';
  let title = '잘했어요!';

  if (accuracy >= 95 && cpm >= 250) {
    grade = 'S';
    gradeColor = 'text-amber-400';
    title = '⚡ 타자의 달인!';
  } else if (accuracy >= 90 && cpm >= 150) {
    grade = 'A';
    gradeColor = 'text-emerald-400';
    title = '🎉 훌륭한 타이핑!';
  } else if (accuracy >= 80) {
    grade = 'B';
    gradeColor = 'text-indigo-400';
    title = '👍 꾸준히 늘고 있어요!';
  } else {
    grade = 'C';
    gradeColor = 'text-rose-400';
    title = '💪 조금 더 집중해볼까요!';
  }

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes}분 ` : ''}${seconds}초`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden"
      >
        {/* 상단 장식광 */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-fuchsia-500/20 rounded-full blur-2xl" />

        {/* 헤더 */}
        <div className="text-center relative z-10 mb-4">
          <div className="text-4xl mb-1">🏆</div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{modeName} 완료 리포트</p>
        </div>

        {/* 등급 배지 */}
        <div className="flex justify-center mb-5 relative z-10">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-2xl shadow-inner">
            <span className="text-xs text-slate-400 font-bold">평가 등급:</span>
            <span className={`text-4xl font-black ${gradeColor} tracking-wider animate-bounce`}>
              {grade}
            </span>
          </div>
        </div>

        {/* 스탯 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-slate-400">평균 타수 (CPM)</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{cpm} <span className="text-xs font-normal text-slate-400">타/분</span></div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-slate-400">정확도</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{accuracy}%</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-slate-400">소요 시간</span>
            <div className="text-xl font-black text-slate-200 mt-1">{timeFormatted}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-slate-400">획득 별 보상</span>
            <div className="text-xl font-black text-yellow-400 mt-1">+{earnedStars} 🌟</div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 relative z-10">
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 font-black rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            🔄 다시 연습하기
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/10 font-bold rounded-xl text-sm text-slate-300 active:scale-95 transition-all"
          >
            📋 메뉴로 나가기
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ResultModal;
