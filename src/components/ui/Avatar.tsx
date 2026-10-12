import clsx from 'clsx'
import { avatarColor, initialsFromTitle } from '../../utils/format'

type AvatarProps = {
  title: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-11 w-11 text-[15px]',
  lg: 'h-14 w-14 text-lg',
}

export function Avatar({ title, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: avatarColor(title) }}
      aria-hidden
    >
      {initialsFromTitle(title)}
    </div>
  )
}
