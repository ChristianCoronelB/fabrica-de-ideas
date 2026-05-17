import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext } from '@/lib/api-auth'
import type { NextRequest } from 'next/server'

// GET /api/ref/institutions - List all institutions
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const institutions = await db.institution.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { projects: true } },
      },
    })

    return NextResponse.json(institutions)
  } catch (error) {
    console.error('Error listing institutions:', error)
    return NextResponse.json({ error: 'Error al listar instituciones' }, { status: 500 })
  }
}

// POST /api/ref/institutions - Create a new institution
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    // Check if institution already exists
    const existing = await db.institution.findFirst({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const institution = await db.institution.create({
      data: { name: name.trim() },
    })

    return NextResponse.json(institution, { status: 201 })
  } catch (error) {
    console.error('Error creating institution:', error)
    return NextResponse.json({ error: 'Error al crear institución' }, { status: 500 })
  }
}
