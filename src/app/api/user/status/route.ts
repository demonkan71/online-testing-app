import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = userIdCookie.value;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        submissions: {
          include: { exam: true },
        },
        certificates: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pretestSubmission = user.submissions.find(s => s.exam.type === 'PRETEST');
    const posttestSubmission = user.submissions.find(s => s.exam.type === 'POSTTEST');
    const certificate = user.certificates[0]; // Assuming 1 cert

    // Helper to calculate rank
    const getRank = async (examType: string, score: number, createdAt: Date) => {
      const allSubmissions = await prisma.submission.findMany({
        where: { exam: { type: examType } },
        select: { id: true, score: true, createdAt: true, userId: true }
      });
      
      // Sort: Score DESC, Date ASC
      allSubmissions.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      const rankIndex = allSubmissions.findIndex(s => s.userId === userId);
      return rankIndex !== -1 ? { rank: rankIndex + 1, total: allSubmissions.length } : null;
    };

    let pretestRank = null;
    let posttestRank = null;

    if (pretestSubmission) {
      pretestRank = await getRank('PRETEST', pretestSubmission.score, pretestSubmission.createdAt);
    }
    if (posttestSubmission) {
      posttestRank = await getRank('POSTTEST', posttestSubmission.score, posttestSubmission.createdAt);
    }

    return NextResponse.json({
      user: { name: user.name, hospital: user.hospital },
      pretest: pretestSubmission ? { score: pretestSubmission.score, isPassed: pretestSubmission.isPassed, ...pretestRank } : null,
      posttest: posttestSubmission ? { score: posttestSubmission.score, isPassed: posttestSubmission.isPassed, ...posttestRank } : null,
      certificateUrl: certificate ? certificate.pdfUrl : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
