import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single member
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: { branch: true, package: true, payments: true },
    });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — update a member
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const member = await prisma.member.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a member
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    // Delete related payments first
    await prisma.payment.deleteMany({ where: { memberId: id } });
    // Delete the member record
    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
