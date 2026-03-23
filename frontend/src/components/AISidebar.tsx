import { useState, useRef, useEffect } from 'react'
import { api } from '../api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  boardId: number
  onBoardUpdate: () => void
}

export default function AISidebar({ boardId, onBoardUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const result = await api.ai.chat(boardId, text)
      setMessages(prev => [...prev, { role: 'assistant', content: result.message }])
      if (result.board_update) onBoardUpdate()
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: 320,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255,255,255,0.03)',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #209dd7, #753991)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', margin: 0, fontFamily: 'Syne, sans-serif' }}>AI Assistant</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Manage your board with chat</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              Ask me to create cards, move tasks, or organize your board.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '9px 13px',
              borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              background: msg.role === 'user' ? '#753991' : 'rgba(255,255,255,0.08)',
              border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              fontSize: 12.5,
              color: msg.role === 'user' ? '#ffffff' : 'rgba(255,255,255,0.85)',
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ marginBottom: 12, display: 'flex' }}>
            <div style={{
              padding: '9px 14px',
              borderRadius: '12px 12px 12px 3px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#209dd7',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 14px 14px' }}>
        <div style={{
          display: 'flex',
          gap: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '8px 8px 8px 12px',
          alignItems: 'flex-end',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
            placeholder="Ask AI to manage your board..."
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: 12.5,
              fontFamily: 'DM Sans, sans-serif',
              resize: 'none',
              lineHeight: 1.5,
              maxHeight: 80,
              overflow: 'auto',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              border: 'none',
              background: input.trim() && !loading ? '#209dd7' : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
