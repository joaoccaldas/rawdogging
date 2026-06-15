import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokestop } from '../types';
import { useInventory } from '../hooks/useInventory';

interface PokestopScreenProps {
  pokestop: Pokestop;
  isSpinable: boolean;
  onClose: () => void;
  onSpin: (id: string) => void;
}

const ITEM_SPRITE_BASE = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/';

const PokestopScreen: React.FC<PokestopScreenProps> = ({ pokestop, isSpinable, onClose, onSpin }) => {
  const [spinning, setSpinning] = useState(false);
  const [rewards, setRewards] = useState<{ pokeballs: number; razzBerries: number; xp: number } | null>(null);
  const { addItems } = useInventory();

  const handleSpin = async () => {
    if (!isSpinable || spinning || rewards) return;
    setSpinning(true);

    const newPokeballs = Math.floor(Math.random() * 4) + 1;
    const newBerries = Math.floor(Math.random() * 2);
    const xp = 50;

    await new Promise(r => setTimeout(r, 1200));

    setSpinning(false);
    setRewards({ pokeballs: newPokeballs, razzBerries: newBerries, xp });
    await addItems({ pokeballs: newPokeballs, razzBerries: newBerries });
    onSpin(pokestop.id);

    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[500] bg-slate-900/90 flex flex-col items-center justify-between p-6 backdrop-blur-md"
    >
      <div className="w-full flex justify-between items-start mt-8">
        <button onClick={onClose} className="bg-slate-800 p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div className="bg-slate-800/80 px-4 py-1 rounded-full border border-slate-600 shadow-md">
          <span className="text-blue-400 font-bold uppercase tracking-wider text-sm">PokéStop</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <motion.div
          animate={spinning ? { rotate: 1080 } : {}}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          onClick={handleSpin}
          className={`relative w-52 h-52 rounded-full flex items-center justify-center cursor-pointer transition-colors ${isSpinable ? 'shadow-[0_0_30px_rgba(56,189,248,0.6)]' : 'shadow-[0_0_30px_rgba(168,85,247,0.5)]'}`}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="96" fill="none" stroke={isSpinable ? '#38bdf8' : '#a855f7'} strokeWidth="3" strokeDasharray="2 10" opacity="0.8" />
          </svg>
          <div className={`w-44 h-44 rounded-full border-[6px] ${isSpinable ? 'border-sky-300 bg-gradient-to-br from-sky-400 to-blue-600' : 'border-purple-300 bg-gradient-to-br from-purple-400 to-purple-700'} flex items-center justify-center shadow-inner`}>
            <div className="w-24 h-24 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
              <img src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/poke-ball.png" alt="PokéStop" className="w-16 h-16 object-contain" />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {rewards && (
            <motion.div initial={{ y: 40, opacity: 0, scale: 0.6 }} animate={{ y: -60, opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-1/4 flex flex-col items-center gap-3">
              <div className="bg-slate-800 border-2 border-yellow-400 rounded-full px-4 py-1.5 font-bold text-yellow-300 shadow-xl text-sm tracking-wide">+{rewards.xp} XP</div>
              <div className="flex gap-3">
                {rewards.pokeballs > 0 && <div className="bg-slate-800 border-2 border-slate-600 rounded-full pl-1.5 pr-3 py-1 font-bold text-white shadow-xl flex items-center gap-1.5"><img src={`${ITEM_SPRITE_BASE}poke-ball.png`} alt="Poké Ball" className="w-7 h-7 object-contain" /> +{rewards.pokeballs}</div>}
                {rewards.razzBerries > 0 && <div className="bg-slate-800 border-2 border-slate-600 rounded-full pl-1.5 pr-3 py-1 font-bold text-white shadow-xl flex items-center gap-1.5"><img src={`${ITEM_SPRITE_BASE}razz-berry.png`} alt="Razz Berry" className="w-7 h-7 object-contain" /> +{rewards.razzBerries}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm mb-12">
        <div className="bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700 mb-6 text-center">
          <p className="text-lg font-medium text-white">{isSpinable ? (spinning ? 'Spinning...' : 'Tap to spin!') : 'This PokéStop is out of items. Try again later.'}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PokestopScreen;
