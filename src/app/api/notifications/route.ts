import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// GET /api/notifications - Get user notifications
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = { userId }

    if (unreadOnly) {
      where.read = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: { userId, read: false },
      }),
    ])

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create notification (admin only)
const createNotificationSchema = z.object({
  userId: z.string().min(1, 'userId es requerido'),
  title: z.string().min(1, 'El título es requerido'),
  message: z.string().min(1, 'El mensaje es requerido'),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
})

export async function POST(request: Request) {
  try {
    const userRole = request.headers.get('x-user-role')

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden crear notificaciones' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = createNotificationSchema.parse(body)

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: validated.userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const notification = await db.notification.create({
      data: {
        userId: validated.userId,
        title: validated.title,
        message: validated.message,
        type: validated.type,
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
