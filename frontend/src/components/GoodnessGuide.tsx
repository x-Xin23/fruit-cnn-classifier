import { motion } from 'framer-motion'
import { Flame, Droplets, Wheat } from 'lucide-react'

interface Props {
  calories: string
  vitaminC: string
  fiber: string
}

const bars = [
  {
    icon: Flame,
    label: '热量',
    color: 'strawberry',
    barClass: 'juice-bar-red',
    getValue: (v: string) => {
      const num = parseFloat(v)
      return Math.min((num / 100) * 100, 100)
    },
  },
  {
    icon: Droplets,
    label: '维生素 C',
    color: 'mango',
    barClass: 'juice-bar-yellow',
    getValue: (v: string) => {
      const num = parseFloat(v)
      return Math.min((num / 100) * 100, 100)
    },
  },
  {
    icon: Wheat,
    label: '膳食纤维',
    color: 'forest',
    barClass: 'juice-bar-green',
    getValue: (v: string) => {
      const num = parseFloat(v)
      return Math.min((num / 5) * 100, 100)
    },
  },
]

export function GoodnessGuide({ calories, vitaminC, fiber }: Props) {
  const values = [calories, vitaminC, fiber]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white rounded-3xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-800 text-brown mb-5 flex items-center gap-2">
        <span className="text-2xl">🧪</span>
        天然指数面板
      </h3>

      <div className="space-y-5">
        {bars.map((bar, i) => {
          const value = values[i]
          const pct = bar.getValue(value)
          const Icon = bar.icon

          return (
            <motion.div
              key={bar.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 150 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${bar.color}`} />
                  <span className="font-700 text-brown text-sm">{bar.label}</span>
                </div>
                <span className="font-800 text-brown text-sm">{value}</span>
              </div>

              <div className="h-3 bg-oat-dark rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full ${bar.barClass}`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
