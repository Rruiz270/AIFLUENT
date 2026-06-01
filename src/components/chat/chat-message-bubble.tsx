'use client'

import { motion } from 'framer-motion'
import { Bot, Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChatBubbleProps {
  direction: 'inbound' | 'outbound'
  content: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
  aiGenerated?: boolean
  senderName?: string
}

export function ChatMessageBubble({
  direction,
  content,
  timestamp,
  status,
  aiGenerated,
  senderName,
}: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex', direction === 'outbound' ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2.5',
          direction === 'outbound'
            ? aiGenerated
              ? 'bg-gradient-to-br from-sky-500 to-blue-600'
              : 'bg-sky-500'
            : 'bg-gray-100 border border-gray-200'
        )}
      >
        {aiGenerated && (
          <div className="flex items-center gap-1 mb-1">
            <Bot className="w-3 h-3 text-amber-200" />
            <span className="text-[10px] text-amber-200 font-medium">Gerado por IA</span>
          </div>
        )}
        {senderName && !aiGenerated && direction === 'outbound' && (
          <p className="text-[10px] text-sky-200 mb-1">{senderName}</p>
        )}
        <p
          className={cn(
            'text-sm whitespace-pre-wrap leading-relaxed',
            direction === 'outbound' ? 'text-white' : 'text-gray-900'
          )}
        >
          {content}
        </p>
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            direction === 'outbound' ? 'justify-end' : ''
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              direction === 'outbound' ? 'text-sky-200' : 'text-gray-400'
            )}
          >
            {timestamp}
          </span>
          {direction === 'outbound' &&
            status &&
            (status === 'read' ? (
              <CheckCheck className="w-3 h-3 text-sky-200" />
            ) : (
              <Check className="w-3 h-3 text-sky-200" />
            ))}
        </div>
      </div>
    </motion.div>
  )
}
