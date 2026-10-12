import { useMutation } from '@tanstack/react-query'
import { GreenApiError, checkAccount } from '../api/greenApi'
import {
  formatPhoneDisplay,
  isValidPhone,
  normalizePhone,
  phoneToNumber,
} from '../utils/phone'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'

export function useCreateChat() {
  const credentials = useAuthStore((state) => state.credentials)
  const upsertChat = useChatStore((state) => state.upsertChat)
  const setActiveChat = useChatStore((state) => state.setActiveChat)

  return useMutation({
    mutationFn: async (rawPhone: string) => {
      if (!credentials) {
        throw new Error('Нет авторизации')
      }

      const digits = normalizePhone(rawPhone)
      if (!isValidPhone(digits)) {
        throw new GreenApiError(
          'Введите номер в международном формате (например 79991234567)',
          400,
        )
      }

      const result = await checkAccount(credentials, phoneToNumber(digits))

      if (result.status === false) {
        throw new GreenApiError(
          result.reason || 'Не удалось проверить номер',
          400,
        )
      }

      if (!result.exist || !result.chatId) {
        throw new GreenApiError(
          'Аккаунт MAX на этом номере не найден',
          404,
        )
      }

      return {
        chatId: result.chatId,
        phone: digits,
        title: formatPhoneDisplay(digits),
      }
    },
    onSuccess: ({ chatId, phone, title }) => {
      upsertChat({ chatId, phone, title, unreadCount: 0 })
      setActiveChat(chatId)
    },
  })
}
