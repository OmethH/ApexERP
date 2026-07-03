import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all staff and trainers merged
export async function GET() {
  try {
    const [staff, trainers] = await Promise.all([
      prisma.staff.findMany({
        include: { branch: true },
      }),
      prisma.trainer.findMany({
        include: { branch: true },
      }),
    ]);

    // Map role: "Trainer" on trainer records (it's defaulted in schema anyway)
    const formattedTrainers = trainers.map(t => ({
      ...t,
      role: 'Trainer',
    }));

    // Merge and sort alphabetically by fullName
    const allEmployees = [...staff, ...formattedTrainers].sort((a, b) =>
      a.fullName.localeCompare(b.fullName)
    );

    return NextResponse.json(allEmployees);
  } catch (error) {
    console.error('GET /api/staff error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create a new staff member or trainer
export async function POST(request) {
  try {
    const body = await request.json();
    const role = body.role || 'Trainer';

    if (role === 'Trainer') {
      // Save directly to the Trainer table
      const trainer = await prisma.trainer.create({
        data: {
          firstName: body.firstName || '',
          lastName: body.lastName || '',
          fullName: body.fullName || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
          email: body.email,
          password: body.password || 'trainer123',
          phone: body.phone || '',
          role: 'Trainer',
          salary: body.salary || 0,
          joinDate: body.joinDate || new Date().toISOString().split('T')[0],
          status: body.status || 'active',
          branchId: body.branchId,
        },
      });
      return NextResponse.json(trainer, { status: 201 });
    } else {
      // Save to the general Staff table
      const staffMember = await prisma.staff.create({
        data: {
          firstName: body.firstName || '',
          lastName: body.lastName || '',
          fullName: body.fullName || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
          email: body.email,
          phone: body.phone || '',
          role,
          salary: body.salary || 0,
          joinDate: body.joinDate || new Date().toISOString().split('T')[0],
          status: body.status || 'active',
          branchId: body.branchId,
        },
      });

      // If a password is provided, also create a User record for system access
      if (body.password) {
        await prisma.user.create({
          data: {
            name: staffMember.fullName,
            email: staffMember.email.toLowerCase(),
            password: body.password,
            role: role,
            branchId: staffMember.branchId,
            staffId: staffMember.id,
          },
        });
      }

      return NextResponse.json(staffMember, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/staff error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
