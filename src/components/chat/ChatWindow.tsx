import { useEffect } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { useChatHistory } from '../../hooks/useChatHistory'
import { useChatStore } from '../../stores/chatStore'
import { Avatar } from '../ui/Avatar'
import { MaxLogo } from '../ui/MaxLogo'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

export function ChatWindow() {
  const activeChatId = useChatStore((state) => state.activeChatId)
  const chat = useChatStore((state) =>
    activeChatId ? state.chats[activeChatId] : null,
  )
  const messages = useChatStore((state) =>
    activeChatId ? (state.messages[activeChatId] ?? []) : [],
  )
  const markChatRead = useChatStore((state) => state.markChatRead)
  const setActiveChat = useChatStore((state) => state.setActiveChat)

  useChatHistory(activeChatId)

  useEffect(() => {
    if (activeChatId) {
      markChatRead(activeChatId)
    }
  }, [activeChatId, messages.length, markChatRead])

  if (!activeChatId || !chat) {
    return (
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-[#141618] md:flex">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative z-10 max-w-sm px-6 text-center">
          <div className="mx-auto mb-4">
            <MaxLogo size={64} />
          </div>
          <h2 className="text-xl font-semibold text-white">Выберите чат</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8B919C]">
            Создайте новый диалог по номеру телефона или откройте существующий
            слева.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-[#141618]">
      <header className="flex items-center gap-3 border-b border-white/5 bg-[#17191D] px-3 py-3 sm:px-4">
        <button
          type="button"
          className="rounded-xl p-2 text-[#A8ADB7] hover:bg-white/5 md:hidden"
          onClick={() => setActiveChat(null)}
          aria-label="Назад к списку чатов"
        >
          <HiOutlineArrowLeft className="text-xl" />
        </button>
        <Avatar title={chat.title} size="sm" />
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-white">
            {chat.title}
          </h2>
          <p className="truncate text-xs text-[#7A808A]">
            {chat.phone ? `+${chat.phone}` : `id ${chat.chatId}`}
          </p>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.045)_1px,transparent_0)] [background-size:20px_20px]" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <MessageList messages={messages} />
          <MessageInput chatId={activeChatId} />
        </div>
      </div>
    </section>
  )
}
