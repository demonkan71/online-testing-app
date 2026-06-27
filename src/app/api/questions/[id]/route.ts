import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { content, optionA, optionB, optionC, optionD, correctOption } = await req.json();

    const question = await prisma.question.update({
      where: { id },
      data: {
        content,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Delete related submission answers first
    await prisma.submissionAnswer.deleteMany({
      where: { questionId: id }
    });
    
    // Then delete the question
    await prisma.question.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
