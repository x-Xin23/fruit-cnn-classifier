import { motion } from 'motion/react';

export default function LoadingPremium() {
  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center">
      <motion.div
        className="w-px h-24 mb-10 overflow-hidden relative shadow-sm"
      >
        <div className="absolute inset-0 bg-stone-200 rounded-full" />
        <motion.div
          className="w-full h-full bg-gradient-to-b from-emerald-400 via-teal-500 to-rose-400 rounded-full absolute inset-0"
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-xs tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700 font-bold"
      >
        正在解构果物标识 ...
      </motion.p>
    </div>
  );
}
