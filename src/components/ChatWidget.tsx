import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getWidgetConfig, getSessionMessages, WidgetConfig } from '@/services/widget'
import { parseAgentChatStream } from '@/lib/skipAi'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created?: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<WidgetConfig | null>(null)
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [wiggling, setWiggling] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let sid = localStorage.getItem('chat_session_id')
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 9)
      localStorage.setItem('chat_session_id', sid)
    }
    setSessionId(sid)

    getWidgetConfig().then((cfg) => {
      if (cfg) setConfig(cfg)
    })

    const timer = setTimeout(() => setWiggling(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!sessionId) return
    getSessionMessages(sessionId).then((history) => {
      if (history.length > 0) {
        setMessages(
          history.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            created: m.created,
          })),
        )
      } else if (config) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: config.welcome_message,
          },
        ])
      }
    })
  }, [sessionId, config])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const toggleOpen = () => {
    if (!isOpen) setUnreadCount(0)
    setIsOpen(!isOpen)
  }

  const handleResetSession = () => {
    const newSid = 'session_' + Math.random().toString(36).substring(2, 9)
    localStorage.setItem('chat_session_id', newSid)
    setSessionId(newSid)
    if (config) {
      setMessages([
        {
          id: 'welcome_' + Date.now(),
          role: 'assistant',
          content: config.welcome_message,
        },
      ])
    } else {
      setMessages([])
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || loading) return

    const userMsg: LocalMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputValue('')
    setLoading(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/widget/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, message: text }),
        },
      )

      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem')
      }

      const assistantMsgId = 'ast_' + Date.now()
      setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }])

      let accumulatedText = ''
      for await (const event of parseAgentChatStream(response)) {
        if (event.type === 'chunk') {
          accumulatedText += event.content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg,
            ),
          )
        }
      }

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1)
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao se comunicar com o assistente. Tente novamente.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const brandColor = config?.brand_color || '#6366f1'
  const assistantName = config?.assistant_name || 'Assistente Virtual'

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[380px] h-[550px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in-up transition-all duration-300">
          <div
            className="p-4 flex items-center justify-between text-white shadow-md"
            style={{ backgroundColor: brandColor }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                {assistantName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">{assistantName}</h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-white/90">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleResetSession}
                title="Nova conversa"
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleOpen}
                title="Fechar"
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] p-3 text-sm rounded-2xl ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700 shadow-sm'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: brandColor } : {}}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {config?.suggestion_chips && config.suggestion_chips.length > 0 && (
            <div className="p-2 px-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex space-x-2 overflow-x-auto scrollbar-none">
              {config.suggestion_chips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  disabled={loading}
                  className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full whitespace-nowrap text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="rounded-full bg-slate-100 dark:bg-slate-800 border-0 focus-visible:ring-1 text-sm"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputValue.trim()}
              size="icon"
              style={{ backgroundColor: brandColor }}
              className="rounded-full text-white h-9 w-9 shrink-0 hover:opacity-90 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
            O que podemos ajudar?
          </div>
        )}

        <button
          onClick={toggleOpen}
          style={{ backgroundColor: brandColor }}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 ${
            wiggling ? 'animate-bounce' : ''
          }`}
        >
          {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}

          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
