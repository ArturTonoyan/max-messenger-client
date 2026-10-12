import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildApiUrl } from '../api/greenApi'
import type { InstanceCredentials } from '../api/types'

type AuthState = {
  credentials: InstanceCredentials | null
  wid: string | null
  login: (params: {
    idInstance: string
    apiTokenInstance: string
    apiUrl?: string
    wid?: string
  }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      credentials: null,
      wid: null,
      login: ({ idInstance, apiTokenInstance, apiUrl, wid }) => {
        const id = idInstance.trim()
        const token = apiTokenInstance.trim()

        set({
          credentials: {
            idInstance: id,
            apiTokenInstance: token,
            apiUrl: buildApiUrl(id, apiUrl),
          },
          wid: wid ?? null,
        })
      },
      logout: () => set({ credentials: null, wid: null }),
    }),
    {
      name: 'max-green-auth',
      partialize: (state) => ({
        credentials: state.credentials,
        wid: state.wid,
      }),
    },
  ),
)
