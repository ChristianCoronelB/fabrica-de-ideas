import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find the notification
    const notification = await db.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      )
    }

    // Verify the notification belongs to the user (or user is admin)
    const userRole = request.headers.get('x-user-role')
    if (notification.userId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tiene permiso para modificar esta notificación' },
        { status: 403 }
      )
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json({ notification: updated })
  } catch (error) {
    console.error('Mark notification read error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
