import type React from 'react';
import { motion } from 'framer-motion';

interface TrainerAvatarProps {
  walking?: boolean;
  heading?: number;
  className?: string;
}

const TrainerAvatar: React.FC<TrainerAvatarProps> = ({ walking = false, heading = 0, className = '' }) => (
  <motion.div
    className={`relative ${className}`}
    animate={{ y: walking ? [0, -2, 0, -1, 0] : [0, -1.5, 0], rotate: heading > 180 ? -1 : 1 }}
    transition={{ duration: walking ? 0.58 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
    style={{ transformOrigin: '50% 88%' }}
    aria-label="Trainer avatar"
  >
    <svg viewBox="0 0 96 160" className="h-full w-full overflow-visible drop-shadow-[0_10px_8px_rgba(20,55,70,.34)]" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#47c4d8" /><stop offset="100%" stopColor="#1887aa" /></linearGradient>
        <linearGradient id="shorts" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#334e78" /><stop offset="100%" stopColor="#172a4f" /></linearGradient>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f2c7a5" /><stop offset="100%" stopColor="#d79a72" /></linearGradient>
      </defs>
      <ellipse cx="48" cy="148" rx="29" ry="8" fill="rgba(22,49,61,.22)" />
      <motion.g animate={walking ? { rotate: [-7, 7, -7] } : { rotate: 0 }} transition={{ duration: 0.58, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '42px 102px' }}>
        <path d="M42 91 L37 126 L30 148 L42 149 L50 126 L51 94Z" fill="url(#shorts)" /><path d="M30 147 Q36 142 43 147 L43 153 L28 153Z" fill="#f3f6fa" /><path d="M29 151 H44" stroke="#1b3450" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      <motion.g animate={walking ? { rotate: [7, -7, 7] } : { rotate: 0 }} transition={{ duration: 0.58, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '55px 102px' }}>
        <path d="M54 91 L58 126 L66 148 L54 149 L46 126 L45 94Z" fill="url(#shorts)" /><path d="M53 147 Q60 142 67 147 L68 153 L52 153Z" fill="#f3f6fa" /><path d="M52 151 H68" stroke="#1b3450" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      <path d="M31 62 Q48 50 66 62 L62 104 Q48 111 34 104Z" fill="url(#shirt)" /><path d="M34 103 Q48 108 62 103 L61 117 Q48 122 35 117Z" fill="#233f6d" /><path d="M45 60 L48 69 L52 60" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" /><circle cx="48" cy="82" r="8" fill="#fff" /><path d="M41 82h14" stroke="#18384c" strokeWidth="3" /><circle cx="48" cy="82" r="3.2" fill="#fff" stroke="#18384c" strokeWidth="2" />
      <motion.path d="M33 65 Q21 79 20 97 Q20 103 26 104 Q31 103 30 97 Q31 83 40 73Z" fill="url(#skin)" animate={walking ? { rotate: [8, -8, 8] } : { rotate: 0 }} transition={{ duration: 0.58, repeat: Infinity }} style={{ transformOrigin: '34px 67px' }} />
      <motion.path d="M63 65 Q75 79 76 97 Q76 103 70 104 Q65 103 66 97 Q65 83 56 73Z" fill="url(#skin)" animate={walking ? { rotate: [-8, 8, -8] } : { rotate: 0 }} transition={{ duration: 0.58, repeat: Infinity }} style={{ transformOrigin: '62px 67px' }} />
      <path d="M37 45 Q48 54 59 45 L59 62 Q48 68 37 62Z" fill="url(#skin)" /><ellipse cx="48" cy="35" rx="18" ry="21" fill="url(#skin)" /><path d="M31 34 Q32 12 48 11 Q65 12 66 34 Q60 25 49 25 Q39 25 31 34Z" fill="#25364b" /><path d="M31 27 Q44 16 65 23 L64 31 Q47 25 32 34Z" fill="#f4f6f7" /><path d="M33 23 Q47 11 63 21 L60 27 Q47 20 34 29Z" fill="#ef4d55" /><circle cx="48" cy="21" r="5" fill="#fff" stroke="#273b4e" strokeWidth="2" /><path d="M43 37 Q48 41 53 37" fill="none" stroke="#9f654d" strokeWidth="1.8" strokeLinecap="round" /><circle cx="41" cy="33" r="1.6" fill="#273b4e" /><circle cx="55" cy="33" r="1.6" fill="#273b4e" />
      <path d="M66 65 Q76 70 75 86 L68 88 Q68 74 59 70Z" fill="#f4c84a" /><path d="M73 72 Q83 80 77 93" fill="none" stroke="#2f5f7a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </motion.div>
);

export default TrainerAvatar;
