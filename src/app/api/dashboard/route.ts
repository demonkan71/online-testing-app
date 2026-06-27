import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Basic stats
    const totalUsers = await prisma.user.count();
    
    // Posttest submissions
    const posttestSubmissions = await prisma.submission.findMany({
      where: { exam: { type: 'POSTTEST' } },
      include: { user: true }
    });

    const pretestSubmissions = await prisma.submission.findMany({
      where: { exam: { type: 'PRETEST' } },
      include: { user: true }
    });

    const totalPassed = posttestSubmissions.filter(s => s.isPassed).length;
    const totalFailed = posttestSubmissions.filter(s => !s.isPassed).length;

    const pretestPassed = pretestSubmissions.filter(s => s.isPassed).length;

    // Chart: Pass vs Fail (Posttest)
    const passFailData = [
      { name: 'ผ่าน', value: totalPassed, fill: '#10B981' },
      { name: 'ไม่ผ่าน', value: totalFailed, fill: '#EF4444' }
    ];

    // Chart: Pretest vs Posttest Passed
    const compareData = [
      { name: 'Pretest', passed: pretestPassed, fill: '#6366F1' },
      { name: 'Posttest', passed: totalPassed, fill: '#10B981' }
    ];

    // Leaderboards
    const getLeaderboard = (submissions: any[]) => {
      // Sort by score desc, then by createdAt asc
      return submissions.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }).slice(0, 5).map(s => ({
        id: s.id,
        name: s.user.name,
        hospital: s.user.hospital,
        score: s.score
      }));
    };

    const pretestLeaderboard = getLeaderboard(pretestSubmissions);
    const posttestLeaderboard = getLeaderboard(posttestSubmissions);

    // Most incorrect questions
    // Get all submission answers that are incorrect for Posttest
    const incorrectAnswers = await prisma.submissionAnswer.findMany({
      where: {
        isCorrect: false,
        submission: { exam: { type: 'POSTTEST' } }
      },
      include: { question: true }
    });

    const questionErrorMap: Record<string, { content: string, count: number }> = {};
    incorrectAnswers.forEach(ans => {
      if (!questionErrorMap[ans.questionId]) {
        questionErrorMap[ans.questionId] = { content: ans.question.content, count: 0 };
      }
      questionErrorMap[ans.questionId].count++;
    });

    const mostIncorrectQuestions = Object.values(questionErrorMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Users list for the table
    const allUsers = await prisma.user.findMany({
      include: {
        submissions: {
          include: { exam: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const usersData = allUsers.map(u => {
      const pretest = u.submissions.find(s => s.exam.type === 'PRETEST');
      const posttest = u.submissions.find(s => s.exam.type === 'POSTTEST');
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        hospital: u.hospital,
        pretestScore: pretest ? pretest.score : null,
        posttestScore: posttest ? posttest.score : null,
        isPassed: posttest ? posttest.isPassed : null,
      };
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalPassed,
        totalFailed
      },
      charts: {
        passFailData,
        compareData,
        mostIncorrectQuestions
      },
      leaderboards: {
        pretest: pretestLeaderboard,
        posttest: posttestLeaderboard
      },
      usersData
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
