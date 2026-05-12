import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden actualizar usuarios' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, role, phone, active } = body

    const user = await db.user.findFirst({
      where: { id, deletedAt: null },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (role && !['ADMIN', 'PARTICIPANT', 'EVALUATOR'].includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(phone !== undefined && { phone }),
        ...(active !== undefined && { active }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        active: true,
        createdAt: true,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'USER_UPDATED',
        details: `Usuario "${user.name}" (${user.email}) actualizado`,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar usuarios' }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === auth.userId) {
      return NextResponse.json({ error: 'No puede eliminar su propia cuenta' }, { status: 400 })
    }

    const user = await db.user.findFirst({
      where: { id, deletedAt: null },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    await db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'USER_DELETED',
        details: `Usuario "${user.name}" (${user.email}) eliminado (soft delete)`,
      },
    })

    return NextResponse.json({ message: 'Usuario eliminado' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}
