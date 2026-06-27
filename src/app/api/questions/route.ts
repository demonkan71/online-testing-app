import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('type') || 'PRETEST'; // PRETEST or POSTTEST

    const exam = await prisma.exam.findFirst({
      where: { type: examType },
      include: {
        questions: true
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json(exam.questions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { examType, content, optionA, optionB, optionC, optionD, correctOption } = await req.json();

    const exam = await prisma.exam.findFirst({
      where: { type: examType }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const question = await prisma.question.create({
      data: {
        examId: exam.id,
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
