import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin, isParticipant, isEvaluator } from '@/lib/api-auth'

// GET /api/projects - List projects
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const areaId = searchParams.get('areaId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause based on role
    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (status) {
      where.status = status
    }
    if (areaId) {
      where.areaId = areaId
    }
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { pitch: { contains: search } },
        { description: { contains: search } },
        { team: { contains: search } },
      ]
    }

    // Role-based filtering
    if (isParticipant(auth)) {
      where.ownerId = auth.userId
    } else if (isEvaluator(auth)) {
      where.evaluators = {
        some: { evaluatorId: auth.userId },
      }
    }
    // ADMIN sees all

    // Build orderBy
    const orderBy: Record<string, string> = {}
    if (sortBy === 'totalScore' || sortBy === 'averageScore') {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc'
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder === 'asc' ? 'asc' : 'desc'
    } else {
      orderBy.createdAt = sortOrder === 'asc' ? 'asc' : 'desc'
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        include: {
          area: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          institution: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true, email: true } },
          evaluators: {
            include: {
              evaluator: { select: { id: true, name: true, email: true } },
            },
          },
          _count: { select: { evaluations: true, attachments: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.project.count({ where }),
    ])

    return NextResponse.json({
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error listing projects:', error)
    return NextResponse.json({ error: 'Error al listar proyectos' }, { status: 500 })
  }
}

// POST /api/projects - Create project
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isParticipant(auth) && !isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo participantes pueden crear proyectos' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name, pitch, description, team, imageUrl,
      leaderName, leaderEmail, leaderPhone, leaderCourse, leaderParallel,
      tutorName, locationMatrix, locationSede, locationExtension,
      areaId, categoryId, institutionId,
    } = body

    // Validate required fields
    if (!name || !pitch || !description || !team || !leaderName || !leaderEmail || !areaId || !categoryId || !institutionId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Verify references exist
    const [area, category, institution] = await Promise.all([
      db.area.findUnique({ where: { id: areaId } }),
      db.category.findUnique({ where: { id: categoryId } }),
      db.institution.findUnique({ where: { id: institutionId } }),
    ])

    if (!area) {
      return NextResponse.json({ error: 'Área no encontrada' }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 400 })
    }
    if (!institution) {
      return NextResponse.json({ error: 'Institución no encontrada' }, { status: 400 })
    }

    const project = await db.project.create({
      data: {
        name,
        pitch,
        description,
        team,
        imageUrl: imageUrl || null,
        leaderName,
        leaderEmail,
        leaderPhone: leaderPhone || null,
        leaderCourse: leaderCourse || null,
        leaderParallel: leaderParallel || null,
        tutorName: tutorName || null,
        locationMatrix: locationMatrix || null,
        locationSede: locationSede || null,
        locationExtension: locationExtension || null,
        areaId,
        categoryId,
        institutionId,
        ownerId: auth.userId,
        status: 'DRAFT',
      },
      include: {
        area: true,
        category: true,
        institution: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: project.id,
        action: 'PROJECT_CREATED',
        details: `Proyecto "${name}" creado`,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Error al crear proyecto' }, { status: 500 })
  }
}
