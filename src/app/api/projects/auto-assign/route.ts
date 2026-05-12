import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'

// POST /api/projects/auto-assign - Auto-assign evaluators
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden auto-asignar evaluadores' }, { status: 403 })
    }

    const body = await request.json()
    const { projectIds, evaluatorsPerProject = 3 } = body

    // Get active evaluators
    const evaluators = await db.user.findMany({
      where: {
        role: 'EVALUATOR',
        active: true,
        deletedAt: null,
      },
      select: { id: true, name: true },
    })

    if (evaluators.length === 0) {
      return NextResponse.json({ error: 'No hay evaluadores disponibles' }, { status: 400 })
    }

    // Get projects to assign
    const whereClause: Record<string, unknown> = {
      deletedAt: null,
    }

    if (projectIds && Array.isArray(projectIds) && projectIds.length > 0) {
      whereClause.id = { in: projectIds }
    }

    const projects = await db.project.findMany({
      where: whereClause,
      include: {
        evaluators: {
          select: { evaluatorId: true },
        },
      },
    })

    if (projects.length === 0) {
      return NextResponse.json({ error: 'No hay proyectos para asignar' }, { status: 400 })
    }

    // Get existing assignments to calculate current load per evaluator
    const existingAssignments = await db.projectEvaluator.findMany({
      select: { evaluatorId: true, projectId: true },
    })

    const evaluatorLoad: Record<string, number> = {}
    evaluators.forEach((e) => {
      evaluatorLoad[e.id] = 0
    })
    existingAssignments.forEach((a) => {
      if (evaluatorLoad[a.evaluatorId] !== undefined) {
        evaluatorLoad[a.evaluatorId]++
      }
    })

    // Sort evaluators by current load (ascending) for even distribution
    const sortedEvaluators = [...evaluators].sort(
      (a, b) => (evaluatorLoad[a.id] || 0) - (evaluatorLoad[b.id] || 0)
    )

    let totalAssigned = 0
    const assignmentResults: Array<{
      projectId: string;
      projectName: string;
      assignedEvaluators: string[];
    }> = []

    for (const project of projects) {
      const existingEvaluatorIds = new Set(project.evaluators.map((e) => e.evaluatorId))
      const needed = evaluatorsPerProject - existingEvaluatorIds.size

      if (needed <= 0) continue

      // Pick evaluators with lowest load who aren't already assigned
      const availableEvaluators = sortedEvaluators.filter(
        (e) => !existingEvaluatorIds.has(e.id)
      )

      const toAssign = availableEvaluators.slice(0, needed)

      if (toAssign.length === 0) continue

      // Create assignments
      await db.projectEvaluator.createMany({
        data: toAssign.map((e) => ({
          projectId: project.id,
          evaluatorId: e.id,
        })),
      })

      // Update load tracking
      toAssign.forEach((e) => {
        evaluatorLoad[e.id] = (evaluatorLoad[e.id] || 0) + 1
      })

      // Re-sort evaluators
      sortedEvaluators.sort(
        (a, b) => (evaluatorLoad[a.id] || 0) - (evaluatorLoad[b.id] || 0)
      )

      // Create notifications
      await db.notification.createMany({
        data: toAssign.map((e) => ({
          userId: e.id,
          title: 'Nuevo proyecto asignado',
          message: `Se te ha asignado el proyecto "${project.name}" para evaluación`,
          type: 'info',
        })),
      })

      totalAssigned += toAssign.length
      assignmentResults.push({
        projectId: project.id,
        projectName: project.name,
        assignedEvaluators: toAssign.map((e) => e.id),
      })
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'EVALUATORS_AUTO_ASSIGNED',
        details: `Auto-asignación: ${totalAssigned} evaluadores a ${assignmentResults.length} proyectos`,
      },
    })

    return NextResponse.json({
      totalAssigned,
      projectsProcessed: assignmentResults.length,
      results: assignmentResults,
    })
  } catch (error) {
    console.error('Error auto-assigning evaluators:', error)
    return NextResponse.json({ error: 'Error al auto-asignar evaluadores' }, { status: 500 })
  }
}
