import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Github, ExternalLink } from 'lucide-react';

interface SupportedFruitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportedFruitsModal({ isOpen, onClose }: SupportedFruitsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--color-canvas)] w-full max-w-lg rounded-[2rem] shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 px-8 border-b border-stone-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-stone-800">Fructus. 鲜果志</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[65vh] overflow-y-auto">
              <p className="text-stone-600 leading-relaxed mb-6">
                一款基于 AI 视觉理解的水果识别应用。上传水果照片，即可获得水果种类识别及详细营养信息。
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-700">MiMo-v2.5 大模型</div>
                    <div className="text-xs text-stone-500 mt-0.5">小米多模态 AI，支持图像理解与分析</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">🍎</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-700">智能水果识别</div>
                    <div className="text-xs text-stone-500 mt-0.5">不限于固定类别，支持任意常见水果</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">📊</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-700">营养信息展示</div>
                    <div className="text-xs text-stone-500 mt-0.5">热量、维生素、膳食纤维、健康功效</div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 mb-6">
                <div className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">技术栈</div>
                <div className="flex flex-wrap gap-2">
                  {['React 19', 'TypeScript', 'Tailwind CSS', 'Netlify Functions', 'MiMo-v2.5'].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-white text-xs font-medium text-stone-600 rounded-full border border-stone-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <a
                  href="https://platform.xiaomimimo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  MiMo 开放平台
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
