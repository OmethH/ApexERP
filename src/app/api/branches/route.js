import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all branches
export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(branches);
  } catch (error) {
    console.error('GET /api/branches error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create a new branch
export async function POST(request) {
  try {
    const body = await request.json();
    const branch = await prisma.branch.create({
      data: {
        name: body.name,
        address: body.address || '',
        location: body.location || '',
        phone: body.phone || '',
        email: body.email || '',
        manager: body.manager || '',
        openDate: body.openDate || new Date().toISOString().split('T')[0],
        status: body.status || 'active',
        isAC: body.isAC ?? false,
        googleMapsLink: body.googleMapsLink || null,
        image: body.image || null,
      },
    });
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error('POST /api/branches error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
