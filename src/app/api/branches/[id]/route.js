import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single branch
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — update a branch
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const branch = await prisma.branch.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a branch
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
