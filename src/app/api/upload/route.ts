import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin, isParticipant } from '@/lib/api-auth'
import { writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

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

    // Generate unique filename
    const ext = path.extname(file.name) || ''
    const uniqueName = `${randomUUID()}${ext}`

    // Save file to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadsDir, uniqueName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Create attachment record
    const attachment = await db.attachment.create({
      data: {
        projectId,
        fileName: file.name,
        filePath: `/uploads/${uniqueName}`,
        fileType: file.type,
        fileSize: file.size,
        category: category || null,
      },
    })

    // If category is 'image' and no imageUrl on project, update it
    if (category === 'image') {
      await db.project.update({
        where: { id: projectId },
        data: { imageUrl: `/uploads/${uniqueName}` },
      })
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId,
        action: 'FILE_UPLOADED',
        details: `Archivo "${file.name}" subido al proyecto`,
      },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
