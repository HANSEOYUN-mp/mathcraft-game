import React from 'react';
import { motion } from 'framer-motion';

function Lobby({ setCurrentView }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {/* Lobby Buttons Vertical Stack */}
      <div className="w-full max-w-xs flex flex-col gap-4 z-10">
        
        {/* Game 1 slot */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={() => setCurrentView('game1')}
          className="w-full cursor-pointer bg-gradient-to-r from-indigo-500 to-blue-600 border-2 border-indigo-400/40 rounded-2xl py-3.5 px-6 flex items-center justify-center gap-3 text-white shadow-xl hover:shadow-indigo-500/20 transition-all font-black text-xl"
        >
          <span className="text-2xl">📦</span>
          <span>묶음 조립 모험</span>
        </motion.button>

        {/* Game 2 slot */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          onClick={() => setCurrentView('game2')}
          className="w-full cursor-pointer bg-gradient-to-r from-fuchsia-600 to-purple-800 border-2 border-fuchsia-400/40 rounded-2xl py-3.5 px-6 flex items-center justify-center gap-3 text-white shadow-xl hover:shadow-fuchsia-500/20 transition-all font-black text-xl"
        >
          <span className="text-2xl">🔮</span>
          <span>숫자 마법사</span>
        </motion.button>

        {/* Game 3 slot */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          onClick={() => setCurrentView('game3')}
          className="w-full cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-700 border-2 border-emerald-400/40 rounded-2xl py-3.5 px-6 flex items-center justify-center gap-3 text-white shadow-xl hover:shadow-emerald-500/20 transition-all font-black text-xl"
        >
          <span className="text-2xl">⌨️</span>
          <span>타자 마스터 모험</span>
        </motion.button>

      </div>
    </div>
  );
}

export default Lobby;
