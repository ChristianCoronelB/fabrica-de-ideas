import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin, isParticipant } from '@/lib/api-auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// Maximum file sizes by category
const MAX_FILE_SIZE = {
  image: 10 * 1024 * 1024,       // 10MB for images
  pitch_video: 20 * 1024 * 1024,  // 20MB for videos
  evidence: 10 * 1024 * 1024,     // 10MB for evidence files
  default: 10 * 1024 * 1024,      // 10MB default
}

// Allowed MIME types by category
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'],
  pitch_video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  evidence: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.ms-excel',
  ],
}

function getUploadsDir(): string {
  // Store files in data/uploads/ (outside public/) so they persist across rebuilds
  // and are accessible at runtime in standalone mode
  const cwd = process.cwd()
  if (cwd.includes('.next/standalone')) {
    return path.join(cwd, '..', '..', 'data', 'uploads')
  }
  return path.join(cwd, 'data', 'uploads')
}

async function ensureUploadsDir(): Promise<string> {
  const uploadsDir = getUploadsDir()
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }
  return uploadsDir
}

// POST /api/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isParticipant(auth) && !isAdmin(auth)) {
      return NextResponse.json({ error: 'No tiene permiso para subir archivos' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string | null
    const category = formData.get('category') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Se requiere projectId' }, { status: 400 })
    }

    // Verify project exists and user has access
    const project = await db.project.findFirst({
      where: { id: projectId, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    const isOwner = project.ownerId === auth.userId
    if (!isAdmin(auth) && !isOwner) {
      return NextResponse.json({ error: 'No tiene permiso para subir archivos a este proyecto' }, { status: 403 })
    }

    // Validate file size
    const maxFileSize = MAX_FILE_SIZE[category as keyof typeof MAX_FILE_SIZE] || MAX_FILE_SIZE.default
    if (file.size > maxFileSize) {
      const maxMB = Math.round(maxFileSize / (1024 * 1024))
      return NextResponse.json(
        { error: `El archivo excede el tamaño máximo permitido de ${maxMB}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[category as keyof typeof ALLOWED_TYPES]
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      // Also check by extension as fallback
      const ext = path.extname(file.name).toLowerCase()
      const allowedExtensions: Record<string, string[]> = {
        image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        pitch_video: ['.mp4', '.webm', '.ogg', '.mov', '.avi'],
        evidence: ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.docx', '.xlsx', '.doc', '.xls'],
      }
      const exts = allowedExtensions[category || ''] || []
      if (!exts.includes(ext)) {
        return NextResponse.json(
          { error: `Tipo de archivo no permitido para la categoría "${category}"` },
          { status: 400 }
        )
      }
    }

    // If replacing image, delete old image attachment and file
    if (category === 'image' && project.imageUrl) {
      try {
        const oldAttachment = await db.attachment.findFirst({
          where: { projectId, category: 'image', filePath: project.imageUrl },
        })
        if (oldAttachment) {
          // Delete old file from filesystem
          const oldFilePath = path.join(getUploadsDir(), path.basename(oldAttachment.filePath))
          if (existsSync(oldFilePath)) {
            const { unlink } = await import('fs/promises')
            await unlink(oldFilePath)
          }
          // Delete old attachment record
          await db.attachment.delete({ where: { id: oldAttachment.id } })
        }
      } catch (cleanupErr) {
        console.warn('Warning: Could not clean up old image:', cleanupErr)
        // Continue with upload even if cleanup fails
      }
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ''
    const uniqueName = `${randomUUID()}${ext}`

    // Ensure uploads directory exists and save file
    const uploadsDir = await ensureUploadsDir()
    const filePath = path.join(uploadsDir, uniqueName)

    console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024).toFixed(1)}KB) -> ${uniqueName}`)
    console.log(`📁 Upload directory: ${uploadsDir}`)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Verify file was written
    if (!existsSync(filePath)) {
      console.error('❌ File was not written successfully:', filePath)
      return NextResponse.json({ error: 'Error al guardar el archivo en el servidor' }, { status: 500 })
    }

    const fileSize = (await import('fs/promises')).stat(filePath).then(s => s.size).catch(() => file.size)

    // Use /api/files/ path so files are served via API route (works in standalone mode)
    const fileUrlPath = `/api/files/${uniqueName}`

    // Create attachment record
    const attachment = await db.attachment.create({
      data: {
        projectId,
        fileName: file.name,
        filePath: fileUrlPath,
        fileType: file.type,
        fileSize: file.size,
        category: category || null,
      },
    })

    // If category is 'image', update project imageUrl
    if (category === 'image') {
      await db.project.update({
        where: { id: projectId },
        data: { imageUrl: fileUrlPath },
      })
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId,
        action: 'FILE_UPLOADED',
        details: `Archivo "${file.name}" subido al proyecto (${category || 'general'})`,
      },
    })

    console.log(`✅ File uploaded successfully: ${uniqueName}`)

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('❌ Error uploading file:', error)
    return NextResponse.json(
      { error: `Error al subir archivo: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    )
  }
}
