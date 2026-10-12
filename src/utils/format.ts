import { format, isToday, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return format(date, 'HH:mm')
}

export function formatChatListTime(timestamp?: number): string {
  if (!timestamp) return ''

  const date = new Date(timestamp * 1000)

  if (isToday(date)) {
    return format(date, 'HH:mm')
  }

  if (isYesterday(date)) {
    return 'вчера'
  }

  return format(date, 'd MMM', { locale: ru })
}

export function formatDaySeparator(timestamp: number): string {
  const date = new Date(timestamp * 1000)

  if (isToday(date)) return 'Сегодня'
  if (isYesterday(date)) return 'Вчера'

  return format(date, 'd MMMM yyyy', { locale: ru })
}

export function initialsFromTitle(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const AVATAR_PALETTE = [
  '#5B8CFF',
  '#6C5CE7',
  '#00B894',
  '#E17055',
  '#0984E3',
  '#FD79A8',
  '#FDCB6E',
  '#00CEC9',
]

export function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}
