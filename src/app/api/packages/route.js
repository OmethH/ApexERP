import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all packages — available to all roles including customers
export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(packages);
  } catch (error) {
    console.error('GET /api/packages error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create a new package (admin only, enforced on frontend)
export async function POST(request) {
  try {
    const body = await request.json();
    const pkg = await prisma.package.create({
      data: {
        name: body.name,
        duration: body.duration || 30,
        price: body.price || 0,
        type: body.type || 'monthly',
        durationType: body.durationType || 'time-based',
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        branchAccess: body.branchAccess || 'all',
        allowedBranches: body.allowedBranches || [],
        status: body.status || 'active',
      },
    });
    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error('POST /api/packages error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
