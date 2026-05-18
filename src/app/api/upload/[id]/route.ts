import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

function getUploadsDir(): string {
  const cwd = process.cwd()
  if (cwd.includes('.next/standalone')) {
    return path.join(cwd, '..', '..', 'data', 'uploads')
  }
  return path.join(cwd, 'data', 'uploads')
}

function getLegacyUploadsDir(): string {
  const cwd = process.cwd()
  if (cwd.includes('.next/standalone')) {
    return path.join(cwd, '..', '..', 'public', 'uploads')
  }
  return path.join(cwd, 'public', 'uploads')
}

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

    // Only owner or admin can delete
    const isOwner = attachment.project.ownerId === auth.userId
    if (!isAdmin(auth) && !isOwner) {
      return NextResponse.json({ error: 'No tiene permiso para eliminar este archivo' }, { status: 403 })
    }

    // Remove file from filesystem (check both data/uploads and legacy public/uploads)
    try {
      const filename = path.basename(attachment.filePath)
      const fullPath = path.join(getUploadsDir(), filename)
      const legacyPath = path.join(getLegacyUploadsDir(), filename)

      if (existsSync(fullPath)) {
        await unlink(fullPath)
        console.log(`🗑️ File deleted from disk: ${filename}`)
      } else if (existsSync(legacyPath)) {
        await unlink(legacyPath)
        console.log(`🗑️ File deleted from legacy disk: ${filename}`)
      } else {
        console.warn(`⚠️ File not found on disk: ${filename}`)
      }
    } catch (err) {
      console.warn('Warning: Could not delete file from disk:', err)
      // Continue with DB deletion even if file deletion fails
    }

    // If this was the project image, clear the imageUrl
    if (attachment.category === 'image') {
      try {
        await db.project.update({
          where: { id: attachment.projectId },
          data: { imageUrl: null },
        })
      } catch {
        // Non-critical
      }
    }

    // Delete attachment record
    await db.attachment.delete({ where: { id } })

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
