import { motion } from 'framer-motion'

const FRUITS = [
  { emoji: '🍎', zh: '苹果', en: 'Apple' },
  { emoji: '🍌', zh: '香蕉', en: 'Banana' },
  { emoji: '🫐', zh: '蓝莓', en: 'Blueberry' },
  { emoji: '🍒', zh: '樱桃', en: 'Cherry' },
  { emoji: '🍇', zh: '葡萄', en: 'Grape' },
  { emoji: '🥝', zh: '猕猴桃', en: 'Kiwi' },
  { emoji: '🍋', zh: '柠檬', en: 'Lemon' },
  { emoji: '🥭', zh: '芒果', en: 'Mango' },
  { emoji: '🍊', zh: '橙子', en: 'Orange' },
  { emoji: '🍑', zh: '桃子', en: 'Peach' },
  { emoji: '🍐', zh: '梨', en: 'Pear' },
  { emoji: '🍍', zh: '菠萝', en: 'Pineapple' },
  { emoji: '🫐', zh: '石榴', en: 'Pomegranate' },
  { emoji: '🍓', zh: '草莓', en: 'Strawberry' },
  { emoji: '🍉', zh: '西瓜', en: 'Watermelon' },
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 },
  },
}

export function FruitGallery() {
  return (
    <section className="px-4 py-12 max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xl font-800 text-brown text-center mb-6"
      >
        🌽 我们认识这些好果子
      </motion.h2>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-3 sm:grid-cols-5 gap-3"
      >
        {FRUITS.map((fruit) => (
          <motion.div
            key={fruit.en}
            variants={item}
            whileHover={{ scale: 1.08, y: -4 }}
            className="bg-white rounded-2xl p-3 text-center shadow-sm cursor-default"
          >
            <div className="text-3xl mb-1">{fruit.emoji}</div>
            <div className="text-sm font-700 text-brown">{fruit.zh}</div>
            <div className="text-xs text-brown-pale font-600">{fruit.en}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
