'use client'

import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

export type ProjectStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FINALIST' | 'WINNER'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: 'Borrador',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  },
  SUBMITTED: {
    label: 'Enviado',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  APPROVED: {
    label: 'Aprobado',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  REJECTED: {
    label: 'Rechazado',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
  },
  FINALIST: {
    label: 'Finalista',
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  },
  WINNER: {
    label: 'Ganador',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} font-medium border`}
    >
      {status === 'WINNER' && <Trophy className="mr-1 h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  )
}
