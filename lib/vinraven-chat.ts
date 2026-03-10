/**
 * Calls the real VinRaven POST /chat API for the demo.
 * Requires NEXT_PUBLIC_VINRAVEN_API_BASE_URL and NEXT_PUBLIC_VINRAVEN_API_KEY.
 */

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_VINRAVEN_API_BASE_URL || process.env.NEXT_PUBLIC_VINRAVEN_API_URL || 'http://localhost:8000').trim()
const API_KEY = (process.env.NEXT_PUBLIC_VINRAVEN_API_KEY ?? '').trim()

export interface ChatResponse {
  conversation_id: string
  response: string
  needs_ticket: boolean
}

export async function sendChatMessage(
  message: string,
  conversationId: string | null
): Promise<ChatResponse> {
  if (!API_KEY) {
    throw new Error('API key not configured. Set NEXT_PUBLIC_VINRAVEN_API_KEY in .env.local.')
  }

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      client_id: 'demo-client',
      message,
      conversation_id: conversationId,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || err?.detail || `Chat failed: ${res.status}`
    throw new Error(msg)
  }

  return res.json()
}

export function isChatConfigured(): boolean {
  return !!API_KEY.trim()
}
