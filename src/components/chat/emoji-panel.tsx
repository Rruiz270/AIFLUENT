'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '😊', '😇',
  '🥰', '😍', '🤩', '😘', '😋', '😜', '🤗', '🤔', '👍', '👋',
]

interface EmojiPanelProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPanel({ onSelect, onClose }: EmojiPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="px-4 sm:px-6 pb-2"
    >
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500">Emojis</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export { EMOJI_LIST }
