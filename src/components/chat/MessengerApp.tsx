import clsx from 'clsx'
import { useState } from 'react'
import { useNotificationPolling } from '../../hooks/useNotificationPolling'
import { useChatStore } from '../../stores/chatStore'
import { ChatWindow } from './ChatWindow'
import { NewChatModal } from './NewChatModal'
import { Sidebar } from './Sidebar'

export function MessengerApp() {
  const [newChatOpen, setNewChatOpen] = useState(false)
  const isMobileChatOpen = useChatStore((state) => state.isMobileChatOpen)

  useNotificationPolling(true)

  return (
    <div className="flex h-dvh overflow-hidden bg-[#0F1114]">
      <div
        className={clsx(
          'h-full w-full md:flex md:w-auto',
          isMobileChatOpen ? 'hidden md:flex' : 'flex',
        )}
      >
        <Sidebar onNewChat={() => setNewChatOpen(true)} />
      </div>

      <div
        className={clsx(
          'h-full min-w-0 flex-1',
          isMobileChatOpen ? 'flex' : 'hidden md:flex',
        )}
      >
        <ChatWindow />
      </div>

      <NewChatModal open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </div>
  )
}
