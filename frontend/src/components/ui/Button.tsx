import React from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-[0_4px_16px_rgba(67,24,255,0.3)]',
  ghost:
    'bg-white text-text-muted border border-border hover:bg-accent hover:text-primary shadow-card',
  danger:
    'bg-danger-dim text-danger border border-danger/20 hover:bg-danger/10'
}

const sizeClass = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm'
}

export default function Button({ variant = 'primary', size = 'md', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
    />
  )
}
