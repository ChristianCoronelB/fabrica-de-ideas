'use client'

import { motion } from 'framer-motion'

interface ScoreCircleProps {
  score: number
  maxScore?: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  animate?: boolean
}

function getScoreColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  if (pct >= 85) return 'text-emerald-500'
  if (pct >= 70) return 'text-green-500'
  if (pct >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreStroke(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  if (pct >= 85) return '#10b981'
  if (pct >= 70) return '#22c55e'
  if (pct >= 50) return '#eab308'
  return '#ef4444'
}

function getScoreBg(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  if (pct >= 85) return 'rgba(16,185,129,0.12)'
  if (pct >= 70) return 'rgba(34,197,94,0.12)'
  if (pct >= 50) return 'rgba(234,179,8,0.12)'
  return 'rgba(239,68,68,0.12)'
}

export function ScoreCircle({
  score,
  maxScore = 100,
  size = 120,
  strokeWidth = 8,
  className = '',
  showLabel = true,
  animate = true,
}: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = maxScore > 0 ? Math.min(score / maxScore, 1) : 0
  const offset = circumference * (1 - pct)
  const color = getScoreStroke(score, maxScore)
  const textColor = getScoreColor(score, maxScore)
  const bgColor = getScoreBg(score, maxScore)
  const center = size / 2

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl font-bold ${textColor}`}
            initial={animate ? { scale: 0.5, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {Math.round(score)}
          </motion.span>
          {maxScore !== 100 && (
            <span className="text-xs text-muted-foreground">
              / {maxScore}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
