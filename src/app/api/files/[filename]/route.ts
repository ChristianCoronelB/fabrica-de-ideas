import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

// MIME type map for common file extensions
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

function getUploadsDir(): string {
  const cwd = process.cwd()
  // In production standalone mode, the cwd is the standalone output directory
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

// GET /api/files/[filename] - Serve uploaded files
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Security: prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename)
    if (sanitizedFilename !== filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Nombre de archivo inválido' }, { status: 400 })
    }

    const uploadsDir = getUploadsDir()
    const filePath = path.join(uploadsDir, sanitizedFilename)

    let fileBuffer: Buffer
    let foundPath: string | null = null

    // Check new location first (data/uploads)
    if (existsSync(filePath)) {
      foundPath = filePath
    } else {
      // Check legacy location (public/uploads) for backward compatibility
      const legacyPath = path.join(getLegacyUploadsDir(), sanitizedFilename)
      if (existsSync(legacyPath)) {
        foundPath = legacyPath
      }
    }

    if (!foundPath) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    // Read file
    fileBuffer = await readFile(foundPath)
    const ext = path.extname(sanitizedFilename).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    // Determine if file should be displayed inline or as attachment
    const isInline = contentType.startsWith('image/') || contentType.startsWith('video/')
    const disposition = isInline ? 'inline' : 'attachment'

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `${disposition}; filename="${sanitizedFilename}"`,
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Error al servir archivo' }, { status: 500 })
  }
}
