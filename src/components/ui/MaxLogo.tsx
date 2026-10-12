type MaxLogoProps = {
  size?: number
}

export function MaxLogo({ size = 56 }: MaxLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="maxGrad" x1="8" y1="8" x2="56" y2="56">
          <stop stopColor="#5B8CFF" />
          <stop offset="1" stopColor="#8B5CFF" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#23262C" />
      <path
        d="M18 22.5c0-3.6 2.9-6.5 6.5-6.5h15c3.6 0 6.5 2.9 6.5 6.5v12c0 3.6-2.9 6.5-6.5 6.5H30l-7.2 6.2c-.8.7-2 .1-2-1V41H24.5c-3.6 0-6.5-2.9-6.5-6.5v-12z"
        fill="url(#maxGrad)"
      />
      <circle cx="28" cy="28.5" r="2.2" fill="#fff" />
      <circle cx="35" cy="28.5" r="2.2" fill="#fff" />
      <circle cx="42" cy="28.5" r="2.2" fill="#fff" />
    </svg>
  )
}
