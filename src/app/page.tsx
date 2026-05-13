'use client'

import React, { useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'

// Lazy load heavy components
const LoginPage = dynamic(() => import('@/components/auth/login-page').then(m => ({ default: m.LoginPage })), { ssr: false })
const AppShell = dynamic(() => import('@/components/app-shell').then(m => ({ default: m.AppShell })), { ssr: false })

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <AppShell />
}
