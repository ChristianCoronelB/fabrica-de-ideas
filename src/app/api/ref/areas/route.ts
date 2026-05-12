import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext } from '@/lib/api-auth'
import type { NextRequest } from 'next/server'

// GET /api/ref/areas - List all areas
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const areas = await db.area.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { projects: true } },
      },
    })

    return NextResponse.json(areas)
  } catch (error) {
    console.error('Error listing areas:', error)
    return NextResponse.json({ error: 'Error al listar áreas' }, { status: 500 })
  }
}
