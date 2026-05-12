'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellOff,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  CheckCheck,
  Loader2,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; colorClass: string; bgClass: string }> = {
  info: {
    icon: Info,
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  success: {
    icon: CheckCircle,
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  warning: {
    icon: AlertTriangle,
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
  },
  error: {
    icon: XCircle,
    colorClass: 'text-red-500',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
  },
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('limit', '50')
      if (filter === 'unread') params.set('unread', 'true')

      const data = await apiFetch<{
        notifications: NotificationItem[]
        total: number
        unreadCount: number
      }>(`/api/notifications?${params.toString()}`)

      let filtered = data.notifications
      if (filter === 'read') {
        filtered = filtered.filter((n) => n.read)
      }

      setNotifications(filtered)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true)
      const unreadNotifications = notifications.filter((n) => !n.read)
      await Promise.all(
        unreadNotifications.map((n) =>
          apiFetch(`/api/notifications/${n.id}/read`, { method: 'PUT' })
        )
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('Todas las notificaciones marcadas como leídas')
    } catch (err) {
      toast.error('Error al marcar notificaciones')
      console.error(err)
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
              : 'No tienes notificaciones sin leer'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} disabled={markingAll}>
              {markingAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={itemVariants}>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              Todas
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1.5">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-1.5">
              No leídas
              {unreadCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 text-[10px] px-1.5 bg-emerald-500 text-white border-0">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Leídas</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={itemVariants} className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <BellOff className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No tienes notificaciones</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Las notificaciones sobre tus proyectos y evaluaciones aparecerán aquí.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {notifications.map((notification) => {
              const config = typeConfig[notification.type] || typeConfig.info
              const IconComponent = config.icon

              return (
                <motion.div
                  key={notification.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read
                        ? 'border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'opacity-75'
                    }`}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full ${config.bgClass} flex items-center justify-center`}
                        >
                          <IconComponent className={`h-5 w-5 ${config.colorClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4
                                className={`text-sm ${
                                  !notification.read ? 'font-semibold' : 'font-medium'
                                }`}
                              >
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  )
}
