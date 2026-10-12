import { useMutation } from '@tanstack/react-query'
import { sendMessage } from '../api/greenApi'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'

type SendPayload = {
  chatId: string
  text: string
}

export function useSendMessage() {
  const credentials = useAuthStore((state) => state.credentials)
  const addMessage = useChatStore((state) => state.addMessage)
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus)

  return useMutation({
    mutationFn: async ({ chatId, text }: SendPayload) => {
      if (!credentials) {
        throw new Error('Нет авторизации')
      }

      const optimisticId = `local-${Date.now()}`
      const timestamp = Math.floor(Date.now() / 1000)

      addMessage({
        id: optimisticId,
        chatId,
        text,
        timestamp,
        direction: 'outgoing',
        status: 'pending',
      })

      try {
        const result = await sendMessage(credentials, chatId, text)
        updateMessageStatus(chatId, optimisticId, 'sent')

        // подменяем локальный id на серверный
        const store = useChatStore.getState()
        const list = store.messages[chatId] ?? []
        store.replaceChatMessages(
          chatId,
          list.map((item) =>
            item.id === optimisticId
              ? { ...item, id: result.idMessage, status: 'sent' }
              : item,
          ),
        )

        return result
      } catch (error) {
        updateMessageStatus(chatId, optimisticId, 'failed')
        throw error
      }
    },
  })
}
