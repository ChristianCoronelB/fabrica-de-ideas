'use client'

import { useEffect, useRef } from 'react'
import { getToken } from '@/lib/api'

/**
 * AutoBackup - Silent background component that triggers backups every 3 minutes
 * when the user is authenticated.
 * No UI, just a background task.
 */
export function AutoBackup() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const triggerBackup = async () => {
      try {
        const token = getToken()
        if (!token) return // Not authenticated, skip

        const response = await fetch('/api/backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log(`[auto-backup] Backup successful at ${data.timestamp}`)
          }
        } else {
          console.warn('[auto-backup] Backup request failed:', response.status)
        }
      } catch (error) {
        // Silent fail - don't disrupt the user experience
        console.warn('[auto-backup] Backup error:', error)
      }
    }

    // Run first backup after 30 seconds (let the app settle first)
    const initialTimeout = setTimeout(() => {
      triggerBackup()
    }, 30000)

    // Then every 3 minutes
    intervalRef.current = setInterval(() => {
      triggerBackup()
    }, 3 * 60 * 1000)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return null // No UI
}
