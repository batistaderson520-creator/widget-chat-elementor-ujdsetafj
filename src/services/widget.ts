import pb from '@/lib/pocketbase/client'

export interface WidgetConfig {
  id: string
  assistant_name: string
  welcome_message: string
  brand_color: string
  suggestion_chips: string[]
  created: string
  updated: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created: string
  updated: string
}

export async function getWidgetConfig(): Promise<WidgetConfig | null> {
  try {
    const list = await pb.collection('widget_config').getFullList<WidgetConfig>({
      sort: '-created',
      requestKey: null,
    })
    return list[0] || null
  } catch (error) {
    console.error('Error fetching widget config:', error)
    return null
  }
}

export async function updateWidgetConfig(
  id: string,
  data: Partial<WidgetConfig>,
): Promise<WidgetConfig> {
  return pb.collection('widget_config').update<WidgetConfig>(id, data)
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    return await pb.collection('messages').getFullList<ChatMessage>({
      filter: `session_id = "${sessionId}"`,
      sort: 'created',
      requestKey: null,
    })
  } catch (error) {
    console.error('Error fetching session messages:', error)
    return []
  }
}

export async function getAllMessages(): Promise<ChatMessage[]> {
  try {
    return await pb.collection('messages').getFullList<ChatMessage>({
      sort: '-created',
      requestKey: null,
    })
  } catch (error) {
    console.error('Error fetching all messages:', error)
    return []
  }
}
