import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/auth — login or register
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // ─── LOGIN ────────────────────────────────────────────
    if (action === 'login') {
      const { email, password } = body;
      const normalizedEmail = email.toLowerCase();

      // 1. Try Admin / Manager / Staff (User table)
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (user && user.password === password) {
        const { password: _, ...safeUser } = user;
        return NextResponse.json(safeUser);
      }

      // 2. Try Trainer (Trainer table)
      const trainer = await prisma.trainer.findUnique({ where: { email: normalizedEmail } });
      if (trainer && trainer.password === password) {
        return NextResponse.json({
          id: trainer.id,
          name: trainer.fullName,
          email: trainer.email,
          role: 'Trainer',
          branchId: trainer.branchId,
          staffId: trainer.id, // mapped as staffId for UI context
        });
      }

      // 3. Try Customer / Gym Member (Member table)
      const member = await prisma.member.findUnique({ where: { email: normalizedEmail } });
      if (member && member.password === password) {
        return NextResponse.json({
          id: member.id,
          name: member.fullName,
          email: member.email,
          role: 'Customer',
          branchId: member.branchId,
          memberId: member.id, // mapped as memberId for UI context
        });
      }

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // ─── REGISTER ─────────────────────────────────────────
    if (action === 'register') {
      const { email, password, role, name, branchId, memberId, staffId } = body;
      const normalizedEmail = email.toLowerCase();

      if (role === 'Customer') {
        // Gym members register directly on their Member record
        const member = await prisma.member.findUnique({ where: { email: normalizedEmail } });
        if (!member) {
          return NextResponse.json({ error: 'Member profile not found for this email' }, { status: 404 });
        }

        const updatedMember = await prisma.member.update({
          where: { email: normalizedEmail },
          data: { password: password },
        });

        return NextResponse.json({
          id: updatedMember.id,
          name: updatedMember.fullName,
          email: updatedMember.email,
          role: 'Customer',
          branchId: updatedMember.branchId,
          memberId: updatedMember.id,
        }, { status: 201 });
      }

      if (role === 'Trainer') {
        // Trainers register directly on their Trainer record
        const trainer = await prisma.trainer.findUnique({ where: { email: normalizedEmail } });
        if (!trainer) {
          return NextResponse.json({ error: 'Trainer profile not found for this email' }, { status: 404 });
        }

        const updatedTrainer = await prisma.trainer.update({
          where: { email: normalizedEmail },
          data: { password: password },
        });

        return NextResponse.json({
          id: updatedTrainer.id,
          name: updatedTrainer.fullName,
          email: updatedTrainer.email,
          role: 'Trainer',
          branchId: updatedTrainer.branchId,
          staffId: updatedTrainer.id,
        }, { status: 201 });
      }

      // Admin / Manager / Staff roles register in the User table
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password,
          role,
          branchId: branchId || null,
          staffId: staffId || null,
        },
      });

      const { password: _, ...safeUser } = newUser;
      return NextResponse.json(safeUser, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
