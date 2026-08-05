import { useState, useEffect, useMemo } from 'react'
import { ChatMessage, getAllMessages } from '@/services/widget'
import { Input } from '@/components/ui/input'
import { Search, MessageSquare, Clock } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export function AdminHistoryList() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [search, setSearch] = useState('')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  const loadData = async () => {
    const list = await getAllMessages()
    setMessages(list)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('messages', () => {
    loadData()
  })

  const sessions = useMemo(() => {
    const map = new Map<string, ChatMessage[]>()
    messages.forEach((msg) => {
      const existing = map.get(msg.session_id) || []
      existing.push(msg)
      map.set(msg.session_id, existing)
    })
    return Array.from(map.entries()).map(([sessionId, msgs]) => ({
      sessionId,
      messages: msgs.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()),
      lastCreated: msgs[0]?.created,
    }))
  }, [messages])

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions
    const query = search.toLowerCase()
    return sessions.filter(
      (s) =>
        s.sessionId.toLowerCase().includes(query) ||
        s.messages.some((m) => m.content.toLowerCase().includes(query)),
    )
  }, [sessions, search])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar histórico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            filteredSessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => setSelectedSession(s.sessionId)}
                className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  selectedSession === s.sessionId ? 'bg-indigo-50 dark:bg-slate-800' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {s.sessionId}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(s.lastCreated).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                  {s.messages[s.messages.length - 1]?.content || 'Sem mensagens'}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl p-4 min-h-[400px] flex flex-col bg-white dark:bg-slate-900">
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">Selecione uma conversa ao lado para visualizar os detalhes.</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[550px] p-2">
            <h3 className="text-xs font-mono text-slate-400 border-b pb-2">
              Sessão: {selectedSession}
            </h3>
            {sessions
              .find((s) => s.sessionId === selectedSession)
              ?.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <span className="block text-[10px] opacity-75 mt-1 text-right">
                      {new Date(m.created).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
