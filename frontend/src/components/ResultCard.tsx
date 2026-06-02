import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import type { PredictionResult } from '../lib/types'
import { GoodnessGuide } from './GoodnessGuide'
import { FunFact } from './FunFact'

interface Props {
  result: PredictionResult
  onReset: () => void
}

const GREETINGS: Record<string, string> = {
  Apple: '你好呀，小苹果！',
  Banana: '嘿，弯弯的香蕉！',
  Blueberry: '哇，蓝莓小精灵！',
  Cherry: '樱桃小可爱来啦！',
  Grape: '葡萄串串真可爱！',
  Kiwi: '哇！元气满满的奇异果！',
  Lemon: '酸酸甜甜小柠檬！',
  Mango: '芒果大王驾到！',
  Orange: '橙子小太阳来啦！',
  Peach: '水蜜桃你好呀！',
  Pear: '梨子小清新！',
  Pineapple: '菠萝菠萝蜜！',
  Pomegranate: '石榴红宝石！',
  Strawberry: '草莓小甜心！',
  Watermelon: '西瓜大侠来也！',
}

export function ResultCard({ result, onReset }: Props) {
  const greeting = GREETINGS[result.fruit_en] || `哇！这是一颗${result.fruit_zh}！`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-12 max-w-lg mx-auto space-y-6"
    >
      {/* Fruit Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="bg-white rounded-3xl p-8 shadow-sm text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
          className="text-8xl mb-4"
        >
          {result.emoji}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-900 text-brown mb-2"
        >
          {greeting}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-brown-pale font-600"
        >
          {result.fruit_zh} · {result.fruit_en}
        </motion.p>

        {/* Confidence badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-forest/10 text-forest font-700 text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
          我有 {(result.confidence * 100).toFixed(1)}% 的把握！
        </motion.div>
      </motion.div>

      {/* Goodness Guide */}
      <GoodnessGuide
        calories={result.nutrition.calories}
        vitaminC={result.nutrition.vitamin_c}
        fiber={result.nutrition.fiber}
      />

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white rounded-3xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-800 text-brown mb-4 flex items-center gap-2">
          <span className="text-2xl">✨</span>
          它的超能力
        </h3>
        <ul className="space-y-3">
          {result.nutrition.benefits.map((b, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-3 text-brown-light text-sm font-600"
            >
              <span className="w-6 h-6 rounded-full bg-forest-pale/20 flex items-center justify-center text-xs shrink-0 mt-0.5">
                🌱
              </span>
              {b}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Fun Fact */}
      <FunFact description={result.nutrition.description} fruitZh={result.fruit_zh} />

      {/* Reset Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-oat-dark text-brown font-700 hover:bg-brown-pale/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          再来一颗！
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
