// app/(mentor)/student-progress/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import StudentProgressClient from './StudentProgressClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Analytics from '@models/Analytics';

export const metadata: Metadata = {
  title: 'Student Progress',
  description: 'Track the writing progress and development of your assigned students.',
};

async function getStudentProgressData(mentorId: string) {
  await connectDB();

  const mentorRaw = await User.findById(mentorId)
    .select('-password')
    .populate('assignedStudents', 'name email age storyCount level points streak lastActiveAt createdAt')
    .lean();

  const mentor = mentorRaw as unknown as import('@/types/user').User & { assignedStudents?: any[] };
  // Defensive: filter out string ids and cast to UserType
  const students = Array.isArray(mentor.assignedStudents)
    ? mentor.assignedStudents.filter(s => typeof s === 'object' && s !== null) as import('@/types/user').User[]
    : [];

  if (!mentor || mentor.role !== 'mentor') {
    return null;
  }

  const studentIds = students.map(s => (s as import('@/types/user').User)._id);

  // Get stories for all students
  const [stories, analytics] = await Promise.all([
    Story.find({ authorId: { $in: studentIds } })
      .populate('authorId', 'name age')
      .sort({ createdAt: -1 })
      .lean(),
    
    Analytics.find({ userId: { $in: studentIds } })
      .sort({ date: -1 })
      .limit(30)
      .lean()
  ]);

  // Calculate statistics for each student
  const studentsWithStats = students.map((student: import('@/types/user').User) => {
    const studentStories = stories.filter(s => {
      const author = typeof s.authorId === 'object' && s.authorId !== null ? s.authorId as { _id: string } : null;
      return author && author._id.toString() === student._id.toString();
    });
    const publishedStories = studentStories.filter(s => s.status === 'published');
    const totalWords = studentStories.reduce((sum: number, s: any) => sum + (s.wordCount || 0), 0);
    const avgWordsPerStory = studentStories.length > 0 ? Math.round(totalWords / studentStories.length) : 0;
    
    // Calculate average scores
    const storiesWithAssessment = studentStories.filter(s => s.aiAssessment);
    const avgOverallScore = storiesWithAssessment.length > 0 
      ? Math.round(storiesWithAssessment.reduce((sum: number, s: any) => sum + (s.aiAssessment?.overallScore || 0), 0) / storiesWithAssessment.length)
      : 0;

    // Recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentStories = studentStories.filter(s => new Date(s.createdAt) >= weekAgo);

    return {
      ...student,
      statistics: {
        totalStories: studentStories.length,
        publishedStories: publishedStories.length,
        draftStories: studentStories.filter(s => s.status === 'draft').length,
        totalWords,
        avgWordsPerStory,
        avgOverallScore,
        recentStories: recentStories.length,
        isActive: new Date((student as any).lastActiveAt || 0) >= weekAgo,
        joinedDaysAgo: Math.floor((Date.now() - new Date(student.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      },
      recentStories: studentStories.slice(0, 3),
    };
  });

  return {
    mentor,
    students: studentsWithStats,
    totalStats: {
      totalStudents: students.length,
      activeStudents: studentsWithStats.filter((s: any) => s.statistics.isActive).length,
      totalStories: stories.length,
      avgScoreAllStudents: studentsWithStats.length > 0 
        ? Math.round(studentsWithStats.reduce((sum: number, s: any) => sum + s.statistics.avgOverallScore, 0) / studentsWithStats.length)
        : 0,
    },
  };
}

export default async function StudentProgressPage() {
    const session = await getServerSession(authOptions);
   
    if (!session?.user) {
      redirect('/login?callbackUrl=/student-progress');
    }
   
    const progressData = await getStudentProgressData(session.user._id);
   
    if (!progressData) {
      redirect('/unauthorized?role=mentor');
    }
   
    return (
      <Suspense 
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingAnimation size="lg" />
          </div>
        }
      >
        <StudentProgressClient 
          mentor={progressData.mentor}
          students={progressData.students}
          totalStats={progressData.totalStats}
        />
      </Suspense>
    );
   }