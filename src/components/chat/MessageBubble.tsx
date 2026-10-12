import clsx from 'clsx'
import {
  IoCheckmark,
  IoCheckmarkDone,
  IoTimeOutline,
  IoWarningOutline,
} from 'react-icons/io5'
import type { ChatMessage } from '../../api/types'
import { formatMessageTime } from '../../utils/format'

type MessageBubbleProps = {
  message: ChatMessage
}

function StatusIcon({ status }: { status?: ChatMessage['status'] }) {
  if (!status || status === 'sent') {
    return <IoCheckmark className="text-[14px] opacity-80" />
  }
  if (status === 'delivered') {
    return <IoCheckmarkDone className="text-[14px] opacity-80" />
  }
  if (status === 'read') {
    return <IoCheckmarkDone className="text-[14px] text-[#9CC4FF]" />
  }
  if (status === 'pending') {
    return <IoTimeOutline className="text-[13px] opacity-70" />
  }
  if (status === 'failed') {
    return <IoWarningOutline className="text-[13px] text-[#FF8D8D]" />
  }
  return null
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const outgoing = message.direction === 'outgoing'

  return (
    <div
      className={clsx(
        'flex w-full',
        outgoing ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={clsx(
          'max-w-[min(78%,420px)] rounded-2xl px-3.5 py-2 shadow-[0_1px_0_rgba(0,0,0,0.2)]',
          outgoing
            ? 'rounded-br-md bg-[linear-gradient(160deg,#3F6FD6_0%,#355FBA_100%)] text-white'
            : 'rounded-bl-md bg-[#2A2E36] text-[#F2F4F7]',
        )}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-[1.35] break-words">
          {message.text}
        </p>
        <div
          className={clsx(
            'mt-1 flex items-center gap-1',
            outgoing ? 'justify-end text-white/70' : 'justify-end text-[#8B919C]',
          )}
        >
          <span className="text-[11px] tabular-nums">
            {formatMessageTime(message.timestamp)}
          </span>
          {outgoing && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  )
}
