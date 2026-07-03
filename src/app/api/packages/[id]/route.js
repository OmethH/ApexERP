import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single package
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — update a package
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pkg = await prisma.package.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — delete a package (soft-delete if members are using it)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if active members use this package
    const activeMembersCount = await prisma.member.count({
      where: { packageId: id, status: 'active' },
    });

    if (activeMembersCount > 0) {
      // Soft-delete: mark as inactive
      await prisma.package.update({
        where: { id },
        data: { status: 'inactive' },
      });
      return NextResponse.json({ softDeleted: true, activeMemberCount: activeMembersCount });
    } else {
      // Hard-delete
      await prisma.package.delete({ where: { id } });
      return NextResponse.json({ softDeleted: false });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
