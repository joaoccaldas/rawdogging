import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Pokestop } from '../types';
import { useInventory } from '../hooks/useInventory';

interface PokestopScreenProps {
  pokestop: Pokestop;
  isSpinable: boolean;
  onClose: () => void;
  onSpin: (id: string) => void;
}

interface SpinRewards {
  pokeballs: number;
  razzBerries: number;
  xp: number;
}

const ITEM_SPRITE_BASE =
  'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/';

const formatStopName = (id: string) =>
  id
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const PokestopScreen: React.FC<PokestopScreenProps> = ({
  pokestop,
  isSpinable,
  onClose,
  onSpin,
}) => {
  const { addItems } = useInventory();
  const [spinning, setSpinning] = useState(false);
  const [discRotation, setDiscRotation] = useState(0);
  const [rewards, setRewards] = useState<SpinRewards | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const stopName = useMemo(
    () => formatStopName(pokestop.id || 'CaldasGO Landmark'),
    [pokestop.id],
  );

  const visited = !isSpinable || Boolean(rewards);
  const accent = visited ? '#8b5cf6' : '#14b8e6';

  const handleSpin = async () => {
    if (!isSpinable || spinning || rewards) return;

    setSpinning(true);
    setDiscRotation((value) => value + 900);

    const newPokeballs = Math.floor(Math.random() * 4) + 2;
    const newBerries = Math.random() > 0.45 ? 1 : 0;
    const xp = 50;

    await new Promise((resolve) => setTimeout(resolve, 900));

    const nextRewards = {
      pokeballs: newPokeballs,
      razzBerries: newBerries,
      xp,
    };

    await addItems({
      pokeballs: newPokeballs,
      razzBerries: newBerries,
    });

    setRewards(nextRewards);
    setSpinning(false);
    onSpin(pokestop.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[800] overflow-hidden bg-[#70cfea]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.72),transparent_32%),linear-gradient(180deg,#8ee5f3_0%,#5bc8e4_44%,#1179b8_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,rgba(4,89,132,0),rgba(3,54,91,0.78))]" />

      <header
        className="relative z-30 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(18px, env(safe-area-inset-top))' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close PokéStop"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/55 bg-slate-900/35 text-white shadow-lg backdrop-blur-md active:scale-95"
        >
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="rounded-full border border-white/40 bg-slate-900/30 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-lg backdrop-blur-md">
          PokéStop
        </div>

        <button
          type="button"
          onClick={() => setShowInfo((value) => !value)}
          aria-label="PokéStop information"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/55 bg-slate-900/35 text-lg font-black text-white shadow-lg backdrop-blur-md active:scale-95"
        >
          i
        </button>
      </header>

      <main className="relative z-10 flex h-[calc(100%-72px)] flex-col items-center">
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-3 z-40 mx-5 rounded-2xl border border-white/50 bg-slate-900/72 p-4 text-center text-sm text-white shadow-2xl backdrop-blur-xl"
            >
              Spin the Photo Disc to receive items. A purple disc means the stop has
              already been visited.
            </motion.div>
          )}
        </AnimatePresence>

        <section className="relative mt-[7vh] flex w-full flex-1 flex-col items-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ backgroundColor: `${accent}55` }}
            />

            <motion.div
              drag={isSpinable && !rewards ? 'x' : false}
              dragConstraints={{ left: -85, right: 85 }}
              dragElastic={0.22}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 45 || Math.abs(info.velocity.x) > 350) {
                  void handleSpin();
                }
              }}
              onClick={() => void handleSpin()}
              animate={{ rotate: discRotation }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative grid h-[252px] w-[252px] touch-pan-y place-items-center rounded-full"
              role="button"
              aria-label="Spin PokéStop Photo Disc"
            >
              <div
                className="absolute inset-0 rounded-full border-[7px] bg-white/25 shadow-[0_18px_50px_rgba(0,41,79,0.42)] backdrop-blur-sm"
                style={{ borderColor: accent }}
              />
              <div
                className="absolute inset-[12px] rounded-full border-[3px] border-white/90"
                style={{
                  boxShadow: `inset 0 0 0 8px ${accent}55, 0 0 30px ${accent}88`,
                }}
              />

              <div className="absolute inset-[28px] overflow-hidden rounded-full border-4 border-white bg-[#d7f4f7] shadow-inner">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#99e7f3_0%,#c8f4f1_48%,#6fc578_49%,#3c9357_100%)]" />
                <div className="absolute left-7 top-8 h-24 w-14 rounded-t-full bg-[#f5d38e] shadow-[18px_6px_0_#e0b365,-15px_17px_0_#f0c77d]" />
                <div className="absolute left-[78px] top-12 h-20 w-24 rounded-t-[48px] bg-[#f4f0e3] shadow-[0_5px_0_#bbb9af]" />
                <div className="absolute right-4 top-14 h-20 w-14 rounded-t-lg bg-[#d98a5f] shadow-[-14px_11px_0_#c66e4b]" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,#77c66e,#3b8b51)]" />
                <div className="absolute bottom-5 left-5 h-12 w-12 rounded-full bg-[#267644] shadow-[35px_5px_0_#2d8250,75px_-2px_0_#236c3f,110px_6px_0_#2a7a48]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.65),transparent_35%)]" />
              </div>

              <div className="pointer-events-none absolute -inset-1 rounded-full border border-white/70" />
            </motion.div>
          </motion.div>

          <div className="mt-7 text-center text-white drop-shadow-md">
            <h1 className="mx-auto max-w-[310px] text-2xl font-black leading-tight tracking-tight">
              {stopName}
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Local landmark
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!rewards ? (
              <motion.div
                key="instruction"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-7 flex flex-col items-center"
              >
                <div className="flex items-center gap-2 rounded-full border border-white/40 bg-slate-900/25 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
                  <motion.span
                    animate={isSpinable ? { x: [-3, 3, -3] } : undefined}
                    transition={{ duration: 1.1, repeat: Infinity }}
                    className="text-xl"
                  >
                    ↔
                  </motion.span>
                  {isSpinable
                    ? spinning
                      ? 'Collecting items…'
                      : 'Swipe the Photo Disc'
                    : 'Come back later'}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, scale: 0.7, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mt-6 flex flex-col items-center"
              >
                <div className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-700 shadow-xl">
                  +{rewards.xp} XP
                </div>
                <div className="mt-4 flex gap-4">
                  <RewardItem
                    image={`${ITEM_SPRITE_BASE}poke-ball.png`}
                    label="Poké Ball"
                    quantity={rewards.pokeballs}
                    delay={0}
                  />
                  {rewards.razzBerries > 0 && (
                    <RewardItem
                      image={`${ITEM_SPRITE_BASE}razz-berry.png`}
                      label="Razz Berry"
                      quantity={rewards.razzBerries}
                      delay={0.08}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer
          className="relative z-20 w-full px-5"
          style={{ paddingBottom: 'max(18px, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-sm items-center gap-3 rounded-[24px] border border-white/40 bg-slate-900/35 p-3 text-white shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/18 text-xl"
              aria-label="Add lure module"
            >
              +
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">
                Empty module
              </p>
              <p className="truncate text-sm font-bold">Install a Lure Module</p>
            </div>
            {rewards && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#1478a6] shadow-lg active:scale-95"
              >
                Done
              </button>
            )}
          </div>
        </footer>
      </main>
    </motion.div>
  );
};

interface RewardItemProps {
  image: string;
  label: string;
  quantity: number;
  delay: number;
}

const RewardItem: React.FC<RewardItemProps> = ({
  image,
  label,
  quantity,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24, rotate: -8 }}
    animate={{ opacity: 1, y: 0, rotate: 0 }}
    transition={{ delay, type: 'spring', stiffness: 260, damping: 18 }}
    className="flex min-w-[112px] items-center gap-2 rounded-2xl border border-white/65 bg-white/90 p-2.5 text-slate-700 shadow-xl"
  >
    <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100">
      <img src={image} alt="" className="h-9 w-9 object-contain" />
    </div>
    <div>
      <p className="text-lg font-black leading-none">+{quantity}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  </motion.div>
);

export default PokestopScreen;
