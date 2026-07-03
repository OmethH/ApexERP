import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const question = await prisma.question.update({
      where: { id },
      data: {
        section: body.section,
        text: body.text,
        type: body.type,
        options: body.options || null,
        required: body.required,
      },
    });
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
