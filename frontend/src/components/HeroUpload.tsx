import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { UploadCloud } from 'lucide-react';

interface HeroUploadProps {
  onImageSelect: (file: File) => void;
}

export default function HeroUpload({ onImageSelect }: HeroUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center my-auto pb-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center mb-10 mt-12 md:mt-20"
      >
        <h1 className="font-serif text-5xl md:text-7xl mb-6 text-center leading-tight text-transparent bg-clip-text bg-gradient-to-br from-emerald-900 via-teal-800 to-stone-800">
          探寻鲜果真味
        </h1>
        <p className="text-stone-500 text-base md:text-lg max-w-2xl text-center italic leading-relaxed tracking-wide">
          上传一份水果的照片。我们将为您深度解析其外观特征与核心营养矩阵，呈现极致的果物美学。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`w-full max-w-2xl aspect-[16/9] md:aspect-[21/9] rounded-[2rem] border-2 border-dashed cursor-pointer flex flex-col items-center justify-center p-8 transition-all duration-500 shadow-sm mt-10 md:mt-14 ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02] shadow-emerald-100' 
            : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-lg hover:shadow-stone-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className={`p-4 rounded-full mb-6 transition-colors duration-500 ${isDragging ? 'bg-emerald-100' : 'bg-stone-50'}`}>
          <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-emerald-600' : 'text-stone-400'}`} strokeWidth={1.5} />
        </div>
        <p className="font-serif text-2xl text-stone-800 mb-2">
          点击或拖拽上传影像
        </p>
        <p className="text-xs tracking-widest uppercase text-stone-400 font-semibold mt-2">
          JPG, PNG · HIGH RESOLUTION
        </p>
      </motion.div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
