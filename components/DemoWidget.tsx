'use client'

import { useState, useRef, useEffect } from 'react'
import { sendChatMessage, isChatConfigured } from '@/lib/vinraven-chat'

// Fallback responses when backend isn't configured
const fallbackResponses: Record<string, string> = {
  hours: "We're open Monday–Friday 9am–6pm, Saturday 10am–4pm.",
  price: 'Pricing starts at $149/mo. Starter plan. Check our pricing section for details.',
  support: 'We offer email support on all plans, priority support on Growth.',
  default:
    "Great question! VinRaven answers using your business knowledge. Set up your API to see real AI responses.",
}

function getFallbackResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (lower.includes(key)) return response
  }
  return fallbackResponses.default
}

export function DemoWidget() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    {
      text: isChatConfigured()
        ? 'Hi! I\'m VinRaven. Ask me about hours, pricing, or support.'
        : 'Hi! Configure NEXT_PUBLIC_VINRAVEN_API_KEY to try the real AI. Otherwise I\'ll use sample answers.',
      isUser: false,
    },
  ])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return

    setInput('')
    setMessages((m) => [...m, { text, isUser: true }])
    setLoading(true)
    setError(null)

    try {
      if (isChatConfigured()) {
        const data = await sendChatMessage(text, conversationId)
        setConversationId(data.conversation_id)
        setMessages((m) => [...m, { text: data.response, isUser: false }])
      } else {
        await new Promise((r) => setTimeout(r, 500))
        setMessages((m) => [...m, { text: getFallbackResponse(text), isUser: false }])
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to get response'
      setError(msg)
      setMessages((m) => [
        ...m,
        {
          text: "Sorry, I couldn't reach the VinRaven API. Check that the backend is running and API key is set.",
          isUser: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 max-w-lg mx-auto">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs">
          {error}
        </div>
      )}
      <div className="space-y-4 max-h-[320px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.isUser
                  ? 'bg-violet-600 text-white rounded-br-md'
                  : 'bg-slate-800/80 border border-slate-700/50 rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-slate-800/80 border border-slate-700/50 text-slate-400">
              …
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && send()}
          placeholder="Ask something a customer would type here…"
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-60"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
