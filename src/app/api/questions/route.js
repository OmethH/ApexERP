import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const questions = await prisma.question.findMany();
    const nextNum = questions.length > 0 
      ? Math.max(...questions.map(q => parseInt(q.id.replace('Q', ''), 10) || 0)) + 1 
      : 1;
    const id = `Q${String(nextNum).padStart(3, '0')}`;

    const question = await prisma.question.create({
      data: {
        id,
        section: body.section,
        text: body.text,
        type: body.type,
        options: body.options || null,
        required: body.required ?? true,
      },
    });
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
