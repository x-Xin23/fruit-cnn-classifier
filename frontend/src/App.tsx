import { useState } from 'react';
import HeroUpload from './components/HeroUpload';
import LoadingPremium from './components/LoadingPremium';
import FruitResult from './components/FruitResult';
import SupportedFruitsModal from './components/SupportedFruitsModal';
import { FruitInfo } from './types';
import { Info } from 'lucide-react';

type AppState = 'IDLE' | 'LOADING' | 'RESULT';

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [fruitInfo, setFruitInfo] = useState<FruitInfo | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resizeImage = (base64Str: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Str);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = error => reject(error);
    });
  };

  const handleImageSelect = async (file: File) => {
    setAppState('LOADING');
    setErrorMsg(null);
    try {
      const rawBase64 = await fileToBase64(file);
      // Generate a responsive optimized version for API upload to save bandwidth
      const optimizedBase64 = await resizeImage(rawBase64, 800, 800);
      setCurrentImageUrl(rawBase64); // show original high res locally
      
      const base64Data = optimizedBase64.split(',')[1];
      // Always treat as jpeg since we forced it in canvas
      const mimeType = 'image/jpeg';

      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageParams: {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '未能解析该水果。');
      }

      setFruitInfo(data as FruitInfo);
      setAppState('RESULT');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '分析过程中发生错误，请稍后重试。');
      setAppState('IDLE');
    }
  };

  const handleReset = () => {
    setAppState('IDLE');
    setFruitInfo(null);
    setCurrentImageUrl(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen font-sans bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <header className="w-full py-6 px-6 md:px-12 flex items-center justify-between border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div 
          className="font-serif text-2xl font-bold tracking-wide text-stone-800 cursor-pointer flex items-baseline gap-2"
          onClick={handleReset}
        >
          <span>Fructus.</span>
          <span className="font-sans text-sm tracking-normal text-emerald-700 font-medium hidden sm:inline-block">鲜果志</span>
        </div>
        <div className="flex flex-col items-center gap-1 relative">
          <div className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-stone-400 hidden sm:block pb-1">
            营养提取与识别分析
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 group p-1.5 px-2 rounded-full hover:bg-stone-50 transition-colors"
            title="查看支持类型"
          >
            <span className="text-[10px] font-bold tracking-widest text-stone-400 group-hover:text-emerald-700 transition-colors hidden md:block">支持类型</span>
            <Info className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition-colors" />
          </button>
        </div>
      </header>

      <main className="w-full flex-grow flex flex-col items-center py-6 md:py-8 px-4 md:px-8">
        {errorMsg && (
          <div className="bg-red-50 text-red-800 px-6 py-4 border border-red-100 text-sm tracking-wide mb-8">
            {errorMsg}
          </div>
        )}

        {appState === 'IDLE' && <HeroUpload onImageSelect={handleImageSelect} />}
        {appState === 'LOADING' && <LoadingPremium />}
        {appState === 'RESULT' && fruitInfo && currentImageUrl && (
          <FruitResult info={fruitInfo} imageUrl={currentImageUrl} onReset={handleReset} />
        )}
      </main>
      
      <SupportedFruitsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
