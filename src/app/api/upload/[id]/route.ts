import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'
import { unlink } from 'fs/promises'
import path from 'path'

// DELETE /api/upload/[id] - Delete attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const attachment = await db.attachment.findUnique({
      where: { id },
      include: { project: true },
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    // Check permission: owner or admin
    if (attachment.project.ownerId !== auth.userId && !isAdmin(auth)) {
      return NextResponse.json({ error: 'No tiene permiso para eliminar este archivo' }, { status: 403 })
    }

    // Delete file from filesystem
    try {
      const fullPath = path.join(process.cwd(), 'public', attachment.filePath)
      await unlink(fullPath)
    } catch {
      // File might already be deleted, continue with DB cleanup
    }

    // Delete attachment record
    await db.attachment.delete({
      where: { id },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: attachment.projectId,
        action: 'FILE_DELETED',
        details: `Archivo "${attachment.fileName}" eliminado`,
      },
    })

    return NextResponse.json({ message: 'Archivo eliminado' })
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json({ error: 'Error al eliminar archivo' }, { status: 500 })
  }
}
