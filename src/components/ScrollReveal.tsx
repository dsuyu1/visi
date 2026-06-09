'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Wraps children in an IntersectionObserver-triggered fade + slide-up,
 * matching the VisibilityDetector pattern from davidcobbina.com.
 */
export function ScrollReveal({
  children,
  className = '',
  threshold = 0.25,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  threshold?: number
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(28px)',
        transition: `opacity 0.75s cubic-bezier(0.65, 0, 0.35, 1) ${delay}ms, transform 0.75s cubic-bezier(0.65, 0, 0.35, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
