import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all payments
export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: { member: true, branch: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('GET /api/payments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — record a new payment
export async function POST(request) {
  try {
    const body = await request.json();

    // Auto-generate a receipt number
    const count = await prisma.payment.count();
    const receiptNo = body.receiptNo || `RCP-${String(count + 1).padStart(5, '0')}`;

    const payment = await prisma.payment.create({
      data: {
        amount: body.amount,
        date: body.date || new Date().toISOString().split('T')[0],
        status: body.status || 'completed',
        receiptNo,
        method: body.method || 'Cash',
        packageId: body.packageId || null,
        packageName: body.packageName || null,
        memberName: body.memberName || null,
        memberId: body.memberId,
        branchId: body.branchId,
      },
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
