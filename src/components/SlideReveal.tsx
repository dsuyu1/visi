'use client'

/**
 * Static wrapper. (Animations removed.)
 */
export function SlideReveal({
  children,
  className = '',
  as: Tag = 'span',
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}) {
  return <Tag className={className}>{children}</Tag>
}
