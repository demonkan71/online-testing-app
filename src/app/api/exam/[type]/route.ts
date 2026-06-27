import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  try {
    const examType = type.toUpperCase();
    if (examType !== 'PRETEST' && examType !== 'POSTTEST') {
      return NextResponse.json({ error: 'Invalid exam type' }, { status: 400 });
    }

    const exam = await prisma.exam.findFirst({
      where: { type: examType },
      include: {
        questions: {
          select: {
            id: true,
            content: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  try {
    const examType = type.toUpperCase();
    const { userId, answers } = await req.json(); 
    // answers is { [questionId]: selectedOption }

    if (!userId || !answers) {
      return NextResponse.json({ error: 'Missing userId or answers' }, { status: 400 });
    }

    const exam = await prisma.exam.findFirst({
      where: { type: examType },
      include: { questions: true }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    let correctCount = 0;
    const submissionAnswersData = [];

    for (const question of exam.questions) {
      const selectedOption = answers[question.id] || '';
      const isCorrect = selectedOption === question.correctOption;
      if (isCorrect) correctCount++;
      
      submissionAnswersData.push({
        questionId: question.id,
        selectedOption,
        isCorrect
      });
    }

    const totalQuestions = exam.questions.length;
    const score = (correctCount / totalQuestions) * 100;
    
    // Passing criteria
    // For PRETEST, we can just say passed if > 0 or whatever, but user wants to show actual score.
    // For POSTTEST, must be >= 80%
    const isPassed = examType === 'POSTTEST' ? score >= 80 : score >= 0; // Pretest always true for isPassed logic, or define another logic. Wait, let's just use score >= 50 for pretest pass/fail visually, but actual score is shown. The user said: "แสดงคะแนนตามจริงที่ทำได้ พร้อมสรุปว่า ผ่าน หรือ ไม่ผ่าน" (I'll use 50% for Pretest passing criteria, 80% for Posttest)

    const isPassedStrict = examType === 'POSTTEST' ? score >= 80 : score >= 50;

    const submission = await prisma.submission.create({
      data: {
        userId,
        examId: exam.id,
        score,
        isPassed: isPassedStrict,
        answers: {
          create: submissionAnswersData
        }
      }
    });

    let pdfUrl = null;
    if (examType === 'POSTTEST' && isPassedStrict) {
      // Create certificate record
      const cert = await prisma.certificate.create({
        data: {
          userId,
          pdfUrl: `/api/certificate/${submission.id}`,
        }
      });
      pdfUrl = cert.pdfUrl;
      // In a real app, send email asynchronously here
    }

    return NextResponse.json({
      success: true,
      score,
      total: totalQuestions,
      correctCount,
      isPassed: isPassedStrict,
      pdfUrl,
      submissionId: submission.id
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
