import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin, isEvaluator } from '@/lib/api-auth'

// GET /api/evaluations - List evaluations
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const evaluatorId = searchParams.get('evaluatorId')
    const isDraft = searchParams.get('isDraft')

    const where: Record<string, unknown> = {}

    if (projectId) {
      where.projectId = projectId
    }
    if (isDraft !== null && isDraft !== undefined) {
      where.isDraft = isDraft === 'true'
    }

    // Role-based filtering
    if (isEvaluator(auth)) {
      where.evaluatorId = auth.userId
    } else if (evaluatorId) {
      where.evaluatorId = evaluatorId
    }
    // ADMIN sees all

    const evaluations = await db.evaluation.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            category: { select: { id: true, name: true } },
          },
        },
        evaluator: {
          select: { id: true, name: true, email: true },
        },
        scores: {
          include: {
            criteria: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(evaluations)
  } catch (error) {
    console.error('Error listing evaluations:', error)
    return NextResponse.json({ error: 'Error al listar evaluaciones' }, { status: 500 })
  }
}

// POST /api/evaluations - Create/start evaluation
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isEvaluator(auth) && !isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo evaluadores pueden crear evaluaciones' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId es requerido' }, { status: 400 })
    }

    const project = await db.project.findFirst({
      where: { id: projectId, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Check that evaluator is assigned to this project
    const assignment = await db.projectEvaluator.findUnique({
      where: {
        projectId_evaluatorId: {
          projectId,
          evaluatorId: auth.userId,
        },
      },
    })

    if (!assignment && !isAdmin(auth)) {
      return NextResponse.json(
        { error: 'No estás asignado a este proyecto' },
        { status: 403 }
      )
    }

    // Check that evaluation doesn't already exist
    const existingEvaluation = await db.evaluation.findUnique({
      where: {
        projectId_evaluatorId: {
          projectId,
          evaluatorId: auth.userId,
        },
      },
    })

    if (existingEvaluation) {
      return NextResponse.json(
        { error: 'Ya existe una evaluación para este proyecto', evaluation: existingEvaluation },
        { status: 400 }
      )
    }

    // Get all criteria
    const criteria = await db.evaluationCriteria.findMany({
      orderBy: { order: 'asc' },
    })

    if (criteria.length === 0) {
      return NextResponse.json(
        { error: 'No hay criterios de evaluación configurados' },
        { status: 400 }
      )
    }

    // Create evaluation with default scores
    const evaluation = await db.evaluation.create({
      data: {
        projectId,
        evaluatorId: auth.userId,
        isDraft: true,
        totalScore: 0,
        scores: {
          create: criteria.map((c) => ({
            criteriaId: c.id,
            score: 0,
            maxScore: c.weight,
          })),
        },
      },
      include: {
        project: {
          select: { id: true, name: true, status: true },
        },
        evaluator: {
          select: { id: true, name: true, email: true },
        },
        scores: {
          include: {
            criteria: true,
          },
        },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId,
        action: 'EVALUATION_STARTED',
        details: `Evaluación iniciada para el proyecto "${project.name}"`,
      },
    })

    return NextResponse.json(evaluation, { status: 201 })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json({ error: 'Error al crear evaluación' }, { status: 500 })
  }
}
