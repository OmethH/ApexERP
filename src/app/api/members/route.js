import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all members (with branch and package info)
export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: { branch: true, package: true },
      orderBy: { joinDate: 'desc' },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error('GET /api/members error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create a new member
export async function POST(request) {
  try {
    const body = await request.json();
    const member = await prisma.member.create({
      data: {
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        fullName: body.fullName || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
        email: body.email,
        password: body.password || 'customer123', // Direct member password
        phone: body.phone || '',
        gender: body.gender || '',
        dateOfBirth: body.dateOfBirth || null,
        address: body.address || null,
        membershipStart: body.membershipStart || null,
        membershipEnd: body.membershipEnd || null,
        status: body.status || 'active',
        joinDate: body.joinDate || new Date().toISOString().split('T')[0],
        emergencyContact: body.emergencyContact || null,
        notes: body.notes || null,
        branchId: body.branchId,
        packageId: body.packageId || null,
        packageName: body.packageName || null,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('POST /api/members error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
