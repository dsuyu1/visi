'use client'
import { useEffect, useState } from 'react'

/**
 * Replicates the AnimatedSlideBox + AnimatedPositionedText from davidcobbina.com.
 * A dark bar wipes in from the left, then exits to the right while the text
 * slides up from below the clip boundary, all in one smooth 1-second sequence.
 */
export function SlideReveal({
  children,
  delay = 0,
  duration = 850,
  className = '',
  as: Tag = 'span',
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}) {
  // 0 = initial (bar off-screen left, text below clip)
  // 1 = bar fully in  (bar at translateX 0%, text still below)
  // 2 = done          (bar off-screen right, text at final position)
  const [phase, setPhase] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), delay)
    const t2 = setTimeout(() => setPhase(2), delay + duration)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [delay, duration])

  const easing = 'cubic-bezier(0.65, 0, 0.35, 1)'
  const ms = `${duration}ms`

  return (
    <Tag className={`relative inline-block overflow-hidden align-bottom ${className}`}>
      {/* text slides up from below the clip area */}
      <span
        className="block"
        style={{
          transform: phase === 2 ? 'translateY(0%)' : 'translateY(105%)',
          transition: `transform ${ms} ${easing}`,
        }}
      >
        {children}
      </span>

      {/* dark wipe bar */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-foreground"
        style={{
          transform:
            phase === 0 ? 'translateX(-105%)' :
            phase === 1 ? 'translateX(0%)' :
                          'translateX(105%)',
          transition: `transform ${ms} ${easing}`,
        }}
      />
    </Tag>
  )
}
