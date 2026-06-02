import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  '正在捏一捏这颗水果...',
  '闻一闻味道...',
  '翻阅大自然的小字典...',
  '让小蜜蜂确认一下...',
  '数一数上面的小斑点...',
  '跟果园里的老农聊聊...',
]

export function LoadingState() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Bouncing fruit */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="text-7xl mb-8"
      >
        🍎
      </motion.div>

      {/* Scrolling text */}
      <div className="h-12 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-xl font-700 text-forest text-center"
          >
            {MESSAGES[idx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Dot loader */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-3 h-3 rounded-full bg-forest-light"
          />
        ))}
      </div>
    </motion.div>
  )
}
