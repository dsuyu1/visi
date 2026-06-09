'use client'

/**
 * Static wrapper. (Animations removed.)
 */
export function ScrollReveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
  threshold?: number
  delay?: number
}) {
  return <div className={className}>{children}</div>
}
