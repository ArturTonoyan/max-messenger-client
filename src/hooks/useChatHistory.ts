import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getChatHistory } from '../api/greenApi'
import type { ChatMessage } from '../api/types'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'

function mapHistoryItem(item: Awaited<ReturnType<typeof getChatHistory>>[number]): ChatMessage | null {
  const text =
    item.textMessage?.trim() ||
    (item.typeMessage === 'textMessage' || item.typeMessage === 'extendedTextMessage'
      ? ''
      : `[${item.typeMessage}]`)

  if (!text && item.typeMessage !== 'textMessage' && item.typeMessage !== 'extendedTextMessage') {
    return {
      id: item.idMessage,
      chatId: item.chatId,
      text: `[${item.typeMessage}]`,
      timestamp: item.timestamp,
      direction: item.type,
      status: (item.statusMessage as ChatMessage['status']) || undefined,
      senderName: item.senderContactName || item.senderName,
    }
  }

  if (!text) return null

  return {
    id: item.idMessage,
    chatId: item.chatId,
    text,
    timestamp: item.timestamp,
    direction: item.type,
    status: (item.statusMessage as ChatMessage['status']) || undefined,
    senderName: item.senderContactName || item.senderName,
  }
}

export function useChatHistory(chatId: string | null) {
  const credentials = useAuthStore((state) => state.credentials)
  const replaceChatMessages = useChatStore((state) => state.replaceChatMessages)
  const localMessages = useChatStore((state) =>
    chatId ? state.messages[chatId] ?? [] : [],
  )

  const query = useQuery({
    queryKey: ['chat-history', credentials?.idInstance, chatId],
    enabled: Boolean(credentials && chatId),
    queryFn: async () => {
      if (!credentials || !chatId) return []
      return getChatHistory(credentials, chatId, 80)
    },
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!chatId || !query.data) return

    const mapped = query.data
      .map(mapHistoryItem)
      .filter((item): item is ChatMessage => Boolean(item))

    // не затираем локальные pending/failed, которых ещё нет на сервере
    const remoteIds = new Set(mapped.map((item) => item.id))
    const localsOnly = localMessages.filter(
      (item) =>
        item.id.startsWith('local-') ||
        (item.status === 'pending' && !remoteIds.has(item.id)),
    )

    const merged = [...mapped]
    for (const local of localsOnly) {
      if (!merged.some((item) => item.id === local.id)) {
        merged.push(local)
      }
    }

    replaceChatMessages(chatId, merged)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- локальные сообщения подмешиваем один раз на ответ API
  }, [chatId, query.data, replaceChatMessages])

  return query
}
