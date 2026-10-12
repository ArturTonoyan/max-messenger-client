import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, ChatPreview } from '../api/types'

type ChatState = {
  chats: Record<string, ChatPreview>
  messages: Record<string, ChatMessage[]>
  activeChatId: string | null
  isMobileChatOpen: boolean
  setActiveChat: (chatId: string | null) => void
  setMobileChatOpen: (open: boolean) => void
  upsertChat: (chat: Partial<ChatPreview> & { chatId: string }) => void
  addMessage: (message: ChatMessage, opts?: { bumpUnread?: boolean }) => void
  updateMessageStatus: (
    chatId: string,
    messageId: string,
    status: ChatMessage['status'],
  ) => void
  replaceChatMessages: (chatId: string, messages: ChatMessage[]) => void
  markChatRead: (chatId: string) => void
  clearChats: () => void
}

function sortMessages(list: ChatMessage[]): ChatMessage[] {
  return [...list].sort((a, b) => {
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp
    return a.id.localeCompare(b.id)
  })
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      messages: {},
      activeChatId: null,
      isMobileChatOpen: false,

      setActiveChat: (chatId) =>
        set({
          activeChatId: chatId,
          isMobileChatOpen: Boolean(chatId),
        }),

      setMobileChatOpen: (open) => set({ isMobileChatOpen: open }),

      upsertChat: (chat) => {
        const prev = get().chats[chat.chatId]
        set({
          chats: {
            ...get().chats,
            [chat.chatId]: {
              chatId: chat.chatId,
              title: chat.title ?? prev?.title ?? chat.chatId,
              phone: chat.phone ?? prev?.phone,
              lastMessage: chat.lastMessage ?? prev?.lastMessage,
              lastTimestamp: chat.lastTimestamp ?? prev?.lastTimestamp,
              unreadCount: chat.unreadCount ?? prev?.unreadCount ?? 0,
            },
          },
        })
      },

      addMessage: (message, opts) => {
        const existing = get().messages[message.chatId] ?? []
        if (existing.some((item) => item.id === message.id)) {
          return
        }

        const nextMessages = sortMessages([...existing, message])
        const chat = get().chats[message.chatId]
        const isActive = get().activeChatId === message.chatId
        const shouldBump =
          Boolean(opts?.bumpUnread) &&
          message.direction === 'incoming' &&
          !isActive

        set({
          messages: {
            ...get().messages,
            [message.chatId]: nextMessages,
          },
          chats: {
            ...get().chats,
            [message.chatId]: {
              chatId: message.chatId,
              title:
                chat?.title ||
                message.senderName ||
                message.chatId,
              phone: chat?.phone,
              lastMessage: message.text,
              lastTimestamp: message.timestamp,
              unreadCount: shouldBump
                ? (chat?.unreadCount ?? 0) + 1
                : (chat?.unreadCount ?? 0),
            },
          },
        })
      },

      updateMessageStatus: (chatId, messageId, status) => {
        const list = get().messages[chatId]
        if (!list) return

        set({
          messages: {
            ...get().messages,
            [chatId]: list.map((item) =>
              item.id === messageId ? { ...item, status } : item,
            ),
          },
        })
      },

      replaceChatMessages: (chatId, messages) => {
        set({
          messages: {
            ...get().messages,
            [chatId]: sortMessages(messages),
          },
        })
      },

      markChatRead: (chatId) => {
        const chat = get().chats[chatId]
        if (!chat || chat.unreadCount === 0) return

        set({
          chats: {
            ...get().chats,
            [chatId]: { ...chat, unreadCount: 0 },
          },
        })
      },

      clearChats: () =>
        set({
          chats: {},
          messages: {},
          activeChatId: null,
          isMobileChatOpen: false,
        }),
    }),
    {
      name: 'max-green-chats',
      partialize: (state) => ({
        chats: state.chats,
        messages: state.messages,
      }),
    },
  ),
)

export function selectChatList(state: ChatState): ChatPreview[] {
  return Object.values(state.chats).sort((a, b) => {
    return (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0)
  })
}
