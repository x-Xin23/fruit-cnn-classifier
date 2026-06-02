import { motion, AnimatePresence } from 'motion/react';
import { X, Sprout } from 'lucide-react';

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
            className="bg-[var(--color-canvas)] w-full max-w-2xl rounded-[2rem] shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 px-8 border-b border-stone-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-stone-800">可解析果物目录</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 max-h-[65vh] overflow-y-auto">
              <p className="text-base text-stone-500 leading-relaxed mb-8">
                本系统依托前沿视觉识别网络，具备泛化的生物识别能力，支持甄别各类温带与热带生境下的常见及珍稀果物。基准数据库覆盖（但不限于）以下品类：
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-8">
                {[
                  { name: '牛油果', en: 'Avocado' },
                  { name: '车厘子', en: 'Cherry' },
                  { name: '奇异果', en: 'Kiwi' },
                  { name: '蓝莓', en: 'Blueberry' },
                  { name: '葡萄柚', en: 'Grapefruit' },
                  { name: '草莓', en: 'Strawberry' },
                  { name: '香蕉', en: 'Banana' },
                  { name: '苹果', en: 'Apple' },
                  { name: '芒果', en: 'Mango' },
                  { name: '百香果', en: 'Passion Fruit' },
                  { name: '无花果', en: 'Fig' },
                  { name: '番木瓜', en: 'Papaya' },
                  { name: '西柚', en: 'Pomelo' },
                  { name: '石榴', en: 'Pomegranate' },
                  { name: '菠萝', en: 'Pineapple' },
                  { name: '红毛丹', en: 'Rambutan' },
                  { name: '黑莓', en: 'Blackberry' },
                  { name: '覆盆子', en: 'Raspberry' }
                ].map((fruit, idx) => (
                  <div key={idx} className="border-b border-stone-100 pb-3 group">
                    <div className="text-sm font-bold text-stone-700 group-hover:text-emerald-700 transition-colors">{fruit.name}</div>
                    <div className="text-xs font-serif italic text-stone-400 mt-1">{fruit.en}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-6 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-400 tracking-widest uppercase font-medium">
                  * 持续演进中，更多未知植物标本亦可尝试解析...
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
