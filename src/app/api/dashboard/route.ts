import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all required data concurrently for much better performance
    const [
      allUsers,
      posttestSubmissions,
      pretestSubmissions,
      incorrectAnswers
    ] = await Promise.all([
      prisma.user.findMany({
        include: {
          submissions: {
            include: { exam: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.submission.findMany({
        where: { exam: { type: 'POSTTEST' } },
        include: { user: true }
      }),
      prisma.submission.findMany({
        where: { exam: { type: 'PRETEST' } },
        include: { user: true }
      }),
      prisma.submissionAnswer.findMany({
        where: {
          isCorrect: false,
          submission: { exam: { type: 'POSTTEST' } }
        },
        include: { question: true }
      })
    ]);

    const totalUsers = allUsers.length;
    const totalPassed = posttestSubmissions.filter(s => s.isPassed).length;
    const totalFailed = posttestSubmissions.filter(s => !s.isPassed).length;
    const pretestPassed = pretestSubmissions.filter(s => s.isPassed).length;

    // Advanced Metrics for Occupation and Attendance
    const osmUsers = allUsers.filter(u => u.occupation === 'อสม.');
    const officerUsers = allUsers.filter(u => u.occupation === 'เจ้าหน้าที่');
    const onsiteUsers = allUsers.filter(u => u.attendanceType === 'On-Site');
    const onlineUsers = allUsers.filter(u => u.attendanceType === 'On-Line');

    const getPassFailCounts = (users: any[]) => {
      let passed = 0;
      let failed = 0;
      users.forEach(u => {
        const posttest = u.submissions.find((s: any) => s.exam.type === 'POSTTEST');
        if (posttest) {
          if (posttest.isPassed) passed++;
          else failed++;
        }
      });
      return { total: users.length, passed, failed };
    };

    const advancedMetrics = {
      osm: getPassFailCounts(osmUsers),
      officer: getPassFailCounts(officerUsers),
      onsite: getPassFailCounts(onsiteUsers),
      online: getPassFailCounts(onlineUsers),
    };

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

    // Leaderboards (Only On-Site users)
    const getLeaderboard = (submissions: any[], extraCondition?: (s: any) => boolean) => {
      return submissions
        .filter(s => s.user.attendanceType === 'On-Site')
        .filter(s => extraCondition ? extraCondition(s) : true)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Earlier submission wins tie
        })
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          name: s.user.name,
          district: s.user.district,
          occupation: s.user.occupation,
          score: s.score,
          submittedAt: s.createdAt
        }));
    };

    const pretestLeaderboard = getLeaderboard(pretestSubmissions);
    const posttestLeaderboard = getLeaderboard(posttestSubmissions);
    const officerPretestLeaderboard = getLeaderboard(pretestSubmissions, s => s.user.occupation === 'เจ้าหน้าที่');
    const officerPosttestLeaderboard = getLeaderboard(posttestSubmissions, s => s.user.occupation === 'เจ้าหน้าที่');

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
    const usersData = allUsers.map(u => {
      const pretest = u.submissions.find(s => s.exam.type === 'PRETEST');
      const posttest = u.submissions.find(s => s.exam.type === 'POSTTEST');
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        hospital: u.hospital,
        district: u.district,
        occupation: u.occupation,
        attendanceType: u.attendanceType,
        pretestScore: pretest ? pretest.score : null,
        posttestScore: posttest ? posttest.score : null,
      };
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalPassed,
        totalFailed,
        advanced: advancedMetrics
      },
      charts: {
        passFailData,
        compareData,
        mostIncorrectQuestions
      },
      leaderboards: {
        pretest: pretestLeaderboard,
        posttest: posttestLeaderboard,
        officerPretest: officerPretestLeaderboard,
        officerPosttest: officerPosttestLeaderboard
      },
      usersData
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
