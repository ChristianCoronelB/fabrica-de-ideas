import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

// App settings API - configurable application properties

// Default settings
const DEFAULT_SETTINGS: Record<string, string> = {
  copyrightText: 'Fábrica de Ideas',
  organizationName: 'Fábrica de Ideas',
}

// GET /api/settings - Get all app settings (public)
export async function GET() {
  try {
    const settings = await db.appSetting.findMany()
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Error getting settings:', error)
    // Return defaults if DB fails
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

// PUT /api/settings - Update app settings (ADMIN only)
export async function PUT(request: NextRequest) {
  try {
    // Since /api/settings bypasses middleware auth, we need to verify the token manually
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
    }

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden modificar la configuración' }, { status: 403 })
    }

    const body = await request.json()

    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== 'string') continue

      await db.appSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    }

    // Return updated settings
    const settings = await db.appSetting.findMany()
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
