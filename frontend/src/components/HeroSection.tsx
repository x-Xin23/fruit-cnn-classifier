import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="text-center pt-12 pb-6 px-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="text-6xl mb-4"
      >
        🍎
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-4xl md:text-5xl font-900 text-brown leading-tight mb-3"
      >
        今天吃点什么
        <br />
        <span className="text-forest">好果子</span>？
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-brown-light text-lg font-600 flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5 text-mango" />
        拍一张水果照片，让我们猜猜它是谁
        <Sparkles className="w-5 h-5 text-mango" />
      </motion.p>
    </motion.section>
  )
}
