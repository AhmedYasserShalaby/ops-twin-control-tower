import type { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const posClass = position === 'top'
    ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    : 'top-full left-1/2 -translate-x-1/2 mt-2'

  return (
    <span className="tooltip-trigger inline-flex">
      {children}
      <span className={`tooltip-content ${posClass}`}>
        {content}
      </span>
    </span>
  )
}
