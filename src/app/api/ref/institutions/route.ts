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
