import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, format, duration = 600, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const frameRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    prevRef.current = to

    if (from === to) {
      setDisplay(to)
      return
    }

    const start = performance.now()
    const delta = to - from

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + delta * eased)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  const text = format ? format(display) : Math.round(display).toLocaleString()

  return <span className={className}>{text}</span>
}
