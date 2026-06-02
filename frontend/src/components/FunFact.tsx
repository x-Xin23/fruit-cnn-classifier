import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

interface Props {
  description: string
  fruitZh: string
}

export function FunFact({ description, fruitZh }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -3, scale: 0.9 }}
      animate={{ opacity: 1, rotate: -1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 150, damping: 15 }}
      className="sticky-note rounded-2xl p-6 max-w-md mx-auto"
    >
      <div className="flex items-start gap-3">
        <div className="bg-mango/20 rounded-full p-2 shrink-0">
          <Lightbulb className="w-5 h-5 text-mango" />
        </div>
        <div>
          <p className="font-800 text-brown text-sm mb-2 flex items-center gap-1">
            <span>📝</span> 冷知识便利贴
          </p>
          <p className="text-brown-light text-sm leading-relaxed font-600">
            {description || `${fruitZh}是一种非常棒的水果，富含多种营养素，常吃对身体很有好处哦！`}
          </p>
        </div>
      </div>

      {/* Tape decoration */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-mango/30 rounded-sm rotate-1" />
    </motion.div>
  )
}
