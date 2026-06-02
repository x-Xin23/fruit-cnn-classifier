import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera } from 'lucide-react'

interface Props {
  onUpload: (file: File) => void
}

export function UploadZone({ onUpload }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) onUpload(file)
    },
    [onUpload]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onUpload(file)
    },
    [onUpload]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 150, damping: 20 }}
      className="px-4 pb-8 max-w-lg mx-auto"
    >
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-3xl border-3 border-dashed
          p-10 text-center transition-all duration-300
          ${isDragging
            ? 'border-forest bg-forest/5 scale-[1.02]'
            : 'border-brown-pale/50 bg-oat-light hover:border-forest-pale hover:bg-white'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleChange}
          className="hidden"
        />

        <motion.div
          animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="mb-4"
        >
          {isDragging ? (
            <Camera className="w-12 h-12 mx-auto text-forest" />
          ) : (
            <Upload className="w-12 h-12 mx-auto text-brown-pale" />
          )}
        </motion.div>

        <p className="text-xl font-800 text-brown mb-2">
          {isDragging ? '松手就对啦！' : '把你的水果举高高让我们瞧瞧'}
        </p>
        <p className="text-sm text-brown-pale font-600">
          拖拽或点击上传 · 支持 JPG / PNG
        </p>

        {/* Decorative fruit emojis */}
        <div className="absolute -top-4 -right-4 text-3xl animate-float">🍊</div>
        <div className="absolute -bottom-3 -left-3 text-2xl animate-float" style={{ animationDelay: '1s' }}>🍇</div>
      </div>
    </motion.div>
  )
}
