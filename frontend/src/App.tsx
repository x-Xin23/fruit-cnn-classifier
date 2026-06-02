import { useState, useEffect } from 'react';
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
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!errorMsg) return;
    setShowError(true);
    const fadeTimer = setTimeout(() => setShowError(false), 2000);
    const removeTimer = setTimeout(() => setErrorMsg(null), 3500);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [errorMsg]);

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
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Str);
        ctx.drawImage(img, 0, 0, width, height);
        // Use lower quality for faster upload (0.6 instead of 0.8)
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = error => reject(error);
    });
  };

  const handleImageSelect = async (file: File) => {
    setAppState('LOADING');
    setErrorMsg(null);
    try {
      const rawBase64 = await fileToBase64(file);
      // Generate a smaller optimized version for faster API upload
      const optimizedBase64 = await resizeImage(rawBase64, 640, 640);
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
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-stone-400 hidden sm:inline">
            营养提取与识别分析
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 rounded-full hover:bg-stone-50 transition-colors"
            title="关于本项目"
          >
            <Info className="w-4 h-4 text-stone-400 hover:text-emerald-700 transition-colors" />
          </button>
        </div>
      </header>

      <main className="w-full flex-grow flex flex-col items-center py-6 md:py-8 px-4 md:px-8">
        {errorMsg && (
          <div className={`bg-amber-50/60 text-amber-800 px-6 py-4 border border-amber-200/50 rounded-2xl text-sm tracking-wide mb-8 transition-all ease-out duration-1000 ${showError ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
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
