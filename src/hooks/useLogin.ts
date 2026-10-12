import { useMutation } from '@tanstack/react-query'
import {
  GreenApiError,
  buildApiUrl,
  getSettings,
  getStateInstance,
  prepareHttpReceiving,
  resolveApiHost,
} from '../api/greenApi'
import type { InstanceCredentials } from '../api/types'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'

export type LoginFormValues = {
  idInstance: string
  apiTokenInstance: string
  apiUrl?: string
}

export function useLogin() {
  const login = useAuthStore((state) => state.login)
  const clearChats = useChatStore((state) => state.clearChats)

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const idInstance = values.idInstance.trim()
      const apiTokenInstance = values.apiTokenInstance.trim()
      const credentials: InstanceCredentials = {
        idInstance,
        apiTokenInstance,
        apiUrl: buildApiUrl(idInstance, values.apiUrl),
      }

      const state = await getStateInstance(credentials)
      if (state.stateInstance !== 'authorized') {
        const host = resolveApiHost(idInstance, values.apiUrl)
        throw new GreenApiError(
          `Инстанс не авторизован (статус: ${state.stateInstance}). В консоли GREEN-API отсканируйте QR. Хост: ${host}`,
          401,
        )
      }

      const settings = await getSettings(credentials)
      await prepareHttpReceiving(credentials)

      return { credentials, wid: settings.wid }
    },
    onSuccess: ({ credentials, wid }) => {
      clearChats()
      login({
        idInstance: credentials.idInstance,
        apiTokenInstance: credentials.apiTokenInstance,
        apiUrl: credentials.apiUrl,
        wid,
      })
    },
  })
}
