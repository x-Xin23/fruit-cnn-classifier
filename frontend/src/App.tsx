import { AnimatePresence, motion } from 'framer-motion'
import { HeroSection } from './components/HeroSection'
import { UploadZone } from './components/UploadZone'
import { LoadingState } from './components/LoadingState'
import { ResultCard } from './components/ResultCard'
import { FruitGallery } from './components/FruitGallery'
import { usePrediction } from './hooks/usePrediction'

function App() {
  const { state, result, error, runPrediction, reset } = usePrediction()

  return (
    <div className="min-h-screen bg-oat">
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <HeroSection />
              <UploadZone onUpload={runPrediction} />
              <FruitGallery />
            </motion.div>
          )}

          {state === 'loading' && (
            <motion.div key="loading" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <LoadingState />
            </motion.div>
          )}

          {state === 'result' && result && (
            <motion.div key="result" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <ResultCard result={result} onReset={reset} />
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 px-4 text-center"
            >
              <div className="text-6xl mb-4">😅</div>
              <p className="text-xl font-700 text-brown mb-2">哎呀，出了点小状况</p>
              <p className="text-brown-pale font-600 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="px-8 py-3 rounded-full bg-forest text-white font-700 hover:bg-forest-light transition-colors"
              >
                再试一次
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center py-8 text-brown-pale text-xs font-600">
          <p>《人工智能基础》期末大作业 · 水果识别与营养信息展示系统</p>
          <p className="mt-1">4 层 CNN · Fruits 360 · 15 种水果</p>
        </footer>
      </div>
    </div>
  )
}

export default App
