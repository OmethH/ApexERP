import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { submittedAt: 'desc' },
    });
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const submissions = await prisma.submission.findMany();
    const nextNum = submissions.length > 0
      ? Math.max(...submissions.map(s => parseInt(s.id.replace('SUB', ''), 10) || 0)) + 1
      : 1;
    const id = `SUB${String(nextNum).padStart(3, '0')}`;

    const submission = await prisma.submission.create({
      data: {
        id,
        memberId: body.memberId,
        memberName: body.memberName,
        email: body.email,
        submittedAt: new Date().toISOString(),
        answers: body.answers,
      },
    });
    return NextResponse.json(submission);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
