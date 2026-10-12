import clsx from 'clsx'
import { useMemo, useState } from 'react'
import {
  HiOutlineLogout,
  HiOutlinePlus,
  HiOutlineSearch,
} from 'react-icons/hi'
import { FreeMode } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { useAuthStore } from '../../stores/authStore'
import { selectChatList, useChatStore } from '../../stores/chatStore'
import { formatChatListTime } from '../../utils/format'
import { Avatar } from '../ui/Avatar'

type SidebarProps = {
  onNewChat: () => void
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const [query, setQuery] = useState('')
  const chats = useChatStore(selectChatList)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const setActiveChat = useChatStore((state) => state.setActiveChat)
  const logout = useAuthStore((state) => state.logout)
  const wid = useAuthStore((state) => state.wid)
  const clearChats = useChatStore((state) => state.clearChats)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chats
    return chats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(q) ||
        chat.phone?.includes(q) ||
        chat.chatId.includes(q),
    )
  }, [chats, query])

  const recent = chats.slice(0, 8)

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/5 bg-[#17191D] md:w-[360px] md:min-w-[320px]">
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Чаты</h1>
          <p className="text-xs text-[#7A808A]">
            {wid ? `аккаунт ${wid.replace('@c.us', '')}` : 'GREEN-API / MAX'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNewChat}
            className="rounded-xl bg-[#5B8CFF]/15 p-2.5 text-[#8DB4FF] hover:bg-[#5B8CFF]/25"
            title="Новый чат"
          >
            <HiOutlinePlus className="text-xl" />
          </button>
          <button
            type="button"
            onClick={() => {
              clearChats()
              logout()
            }}
            className="rounded-xl p-2.5 text-[#8B919C] hover:bg-white/5 hover:text-white"
            title="Выйти"
          >
            <HiOutlineLogout className="text-xl" />
          </button>
        </div>
      </header>

      <div className="px-4 pb-3">
        <label className="relative block">
          <HiOutlineSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#7A808A]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск"
            className="h-10 w-full rounded-xl border border-transparent bg-[#23262C] pr-3 pl-9 text-sm text-white outline-none placeholder:text-[#6E7480] focus:border-[#5B8CFF]/40"
          />
        </label>
      </div>

      {recent.length > 0 && (
        <div className="border-b border-white/5 px-4 pb-3">
          <p className="mb-2 text-xs font-medium tracking-wide text-[#6E7480] uppercase">
            Недавние
          </p>
          <Swiper
            modules={[FreeMode]}
            freeMode
            slidesPerView="auto"
            spaceBetween={10}
            className="!overflow-visible"
          >
            {recent.map((chat) => (
              <SwiperSlide key={chat.chatId} className="!w-auto">
                <button
                  type="button"
                  onClick={() => setActiveChat(chat.chatId)}
                  className="flex w-[72px] flex-col items-center gap-1.5"
                >
                  <Avatar title={chat.title} size="sm" />
                  <span className="w-full truncate text-center text-[11px] text-[#B4B9C2]">
                    {chat.title}
                  </span>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-sm text-[#8B919C]">Пока нет чатов</p>
            <button
              type="button"
              onClick={onNewChat}
              className="mt-3 text-sm font-medium text-[#7EB0FF] hover:underline"
            >
              Начать переписку
            </button>
          </div>
        ) : (
          filtered.map((chat) => {
            const active = chat.chatId === activeChatId
            return (
              <button
                key={chat.chatId}
                type="button"
                onClick={() => setActiveChat(chat.chatId)}
                className={clsx(
                  'mb-0.5 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition',
                  active ? 'bg-[#2A2E36]' : 'hover:bg-white/[0.04]',
                )}
              >
                <Avatar title={chat.title} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[15px] font-medium text-white">
                      {chat.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-[#6E7480]">
                      {formatChatListTime(chat.lastTimestamp)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] text-[#8B919C]">
                      {chat.lastMessage || 'Нет сообщений'}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#5B8CFF] px-1.5 text-[11px] font-semibold text-white">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
