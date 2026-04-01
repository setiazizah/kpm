import React from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`bg-white border border-border rounded-2xl shadow-card overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: Props) {
  return (
    <div className={`px-5 py-4 border-b border-border flex items-center justify-between ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: Props) {
  return (
    <span className={`text-[13px] font-bold text-text-main ${className}`}>
      {children}
    </span>
  )
}

export function CardBody({ children, className = '' }: Props) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  )
}
