import { useEffect, useMemo, useRef } from 'react'
import type { ChatMessage } from '../../api/types'
import { formatDaySeparator } from '../../utils/format'
import { MessageBubble } from './MessageBubble'

type MessageListProps = {
  messages: ChatMessage[]
}

type DayGroup = {
  key: string
  label: string
  items: ChatMessage[]
}

function groupByDay(messages: ChatMessage[]): DayGroup[] {
  const groups: DayGroup[] = []

  for (const message of messages) {
    const date = new Date(message.timestamp * 1000)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    const last = groups[groups.length - 1]

    if (!last || last.key !== key) {
      groups.push({
        key,
        label: formatDaySeparator(message.timestamp),
        items: [message],
      })
    } else {
      last.items.push(message)
    }
  }

  return groups
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const groups = useMemo(() => groupByDay(messages), [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, messages.at(-1)?.id])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="max-w-xs text-sm text-[#8B919C]">
          Напишите первое сообщение — оно уйдёт в MAX через GREEN-API
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-2.5">
            <div className="sticky top-1 z-10 flex justify-center py-1">
              <span className="rounded-full bg-[#141618]/75 px-3 py-1 text-[11px] font-medium text-[#A8ADB7] backdrop-blur">
                {group.label}
              </span>
            </div>
            {group.items.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
