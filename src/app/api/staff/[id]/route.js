import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single employee (Staff or Trainer)
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Check Trainer first
    let employee = await prisma.trainer.findUnique({
      where: { id },
      include: { branch: true },
    });

    if (employee) {
      return NextResponse.json({ ...employee, role: 'Trainer' });
    }

    // Check general Staff
    employee = await prisma.staff.findUnique({
      where: { id },
      include: { branch: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — update an employee (Staff or Trainer)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if they are a Trainer
    const isTrainer = await prisma.trainer.findUnique({ where: { id } });
    if (isTrainer) {
      const updated = await prisma.trainer.update({
        where: { id },
        data: body,
      });
      return NextResponse.json({ ...updated, role: 'Trainer' });
    }

    // Otherwise, they are general Staff
    const updated = await prisma.staff.update({
      where: { id },
      data: body,
    });

    // Also update their User record if it exists
    await prisma.user.updateMany({
      where: { staffId: id },
      data: {
        name: updated.fullName,
        email: updated.email.toLowerCase(),
        role: updated.role,
        branchId: updated.branchId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE an employee (Staff or Trainer)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if they are a Trainer
    const isTrainer = await prisma.trainer.findUnique({ where: { id } });
    if (isTrainer) {
      await prisma.trainer.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    // Otherwise, they are general Staff
    // Delete related user account first if exists
    await prisma.user.deleteMany({ where: { staffId: id } });
    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
