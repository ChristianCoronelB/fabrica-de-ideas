import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'

const VALID_STATUSES = ['SUBMITTED', 'APPROVED', 'REJECTED', 'FINALIST', 'WINNER']

// PATCH /api/projects/[id]/status - Update project status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden cambiar el estado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser uno de: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const project = await db.project.findFirst({
      where: { id, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: { status },
      include: {
        area: true,
        category: true,
        institution: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: id,
        action: 'PROJECT_STATUS_CHANGED',
        details: `Estado cambiado de ${project.status} a ${status}`,
      },
    })

    // Create notification for project owner
    const statusMessages: Record<string, string> = {
      SUBMITTED: 'Tu proyecto ha sido marcado como enviado',
      APPROVED: '¡Tu proyecto ha sido aprobado!',
      REJECTED: 'Tu proyecto ha sido rechazado',
      FINALIST: '¡Felicitaciones! Tu proyecto es finalista',
      WINNER: '¡Felicitaciones! Tu proyecto es el ganador',
    }

    const statusTypes: Record<string, string> = {
      SUBMITTED: 'info',
      APPROVED: 'success',
      REJECTED: 'error',
      FINALIST: 'success',
      WINNER: 'success',
    }

    await db.notification.create({
      data: {
        userId: project.ownerId,
        title: `Estado del proyecto: ${status}`,
        message: statusMessages[status] || `El estado de tu proyecto "${project.name}" ha cambiado a ${status}`,
        type: statusTypes[status] || 'info',
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project status:', error)
    return NextResponse.json({ error: 'Error al actualizar estado del proyecto' }, { status: 500 })
  }
}
