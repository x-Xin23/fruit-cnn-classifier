import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Sprout, Lightbulb, Activity, Flame, Leaf, CheckCircle2 } from 'lucide-react';
import { FruitInfo } from '../types';

interface FruitResultProps {
  info: FruitInfo;
  imageUrl: string;
  onReset: () => void;
}

export default function FruitResult({ info, imageUrl, onReset }: FruitResultProps) {
  const getNutrientColor = (index: number) => {
    const colors = [
      { bg: 'bg-amber-200', track: 'bg-stone-100', icon: 'text-amber-600/70' },
      { bg: 'bg-emerald-300/90', track: 'bg-stone-100', icon: 'text-emerald-600/70' },
      { bg: 'bg-sky-200', track: 'bg-stone-100', icon: 'text-sky-600/70' },
      { bg: 'bg-rose-200', track: 'bg-stone-100', icon: 'text-rose-500/70' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-2 pb-24">
      <motion.button
        onClick={onReset}
        whileHover={{ x: -4 }}
        className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-stone-400 mb-8 -mt-4 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        重新解析
      </motion.button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col gap-10 lg:gap-12"
      >
        {/* Header Panel */}
        <div className="border-b border-stone-200 pb-10 text-center max-w-4xl mx-auto w-full">
          <p className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-emerald-700 mb-4 flex items-center justify-center gap-2">
            <Sprout className="w-4 h-4" />
            {info.scientificName}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 leading-tight">
            {info.name}
          </h1>
          <p className="text-lg md:text-xl text-stone-600 font-serif italic leading-relaxed px-4 md:px-10">
            "{info.highlights}"
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Image Section */}
          <div className="w-full lg:w-2/5 flex-shrink-0 mx-auto max-w-md lg:max-w-none cursor-pointer">
            <div className="aspect-[4/3] lg:aspect-square w-full relative group flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt={info.name} 
                className="w-full h-full object-cover md:object-contain filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
              />
              
              {/* Panel 3: Trivia Overlay on Hover */}
              {info.trivia && (
                <div className="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-8 bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-2xl pointer-events-none">
                  <h3 className="text-sm font-bold tracking-wider text-amber-700 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    科普拓展阅读
                  </h3>
                  <p className="text-stone-700 font-medium leading-relaxed text-sm">
                    {info.trivia}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Panels Section */}
          <div className="w-full lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
            
            {/* Panel 1: Natural Index */}
            <div className="bg-white rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-stone-800 mb-5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600/70" />
                营养成分评估
              </h3>
              
              <div className="space-y-4">
                {/* Calories Row */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500/80" /> 热量
                    </span>
                    <span className="text-sm font-bold text-stone-900">{info.calories}</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${info.caloriePercentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-orange-300/80 rounded-full"
                    />
                  </div>
                </div>

                {/* Dynamic Nutrients Row */}
                {info.nutritionalProfile?.map((nutrient, i) => {
                  const color = getNutrientColor(i);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
                          <Leaf className={`w-4 h-4 ${color.icon}`} /> {nutrient.label}
                        </span>
                        <span className="text-sm font-bold text-stone-900">{nutrient.value}</span>
                      </div>
                      <div className={`w-full h-2.5 ${color.track} rounded-full overflow-hidden`}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${nutrient.percentage}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                          className={`h-full ${color.bg} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel 2: Superpowers */}
            {info.superpowers && info.superpowers.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100 flex-col flex justify-center">
                <h3 className="text-lg font-bold text-stone-800 mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600/70" />
                  核心功效与价值
                </h3>
                <ul className="space-y-4">
                  {info.superpowers.map((power, i) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      key={i} 
                      className="flex items-start gap-4"
                    >
                      <div className="mt-0.5 bg-emerald-50 rounded-full p-1 border border-emerald-100 flex-shrink-0">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-stone-600 text-sm font-medium leading-relaxed mt-0.5">
                        {power}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}
