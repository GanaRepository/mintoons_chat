import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import MentorManagementClient from './MentorManagementClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Comment from '@models/Comment';
import { User as UserType } from '@/types/user';
import { Comment as CommentType } from '@/types/comment';

export const metadata: Metadata = {
  title: 'Mentor Management | Admin Dashboard - MINTOONS',
  description:
    'Create, manage, and assign mentors to students. Monitor mentor activity and performance on the MINTOONS platform.',
  keywords: [
    'mentor management',
    'teacher assignment',
    'student mentoring',
    'education admin',
  ],
  openGraph: {
    title: 'Mentor Management - MINTOONS Admin',
    description:
      'Comprehensive mentor management system for educational storytelling platform',
    type: 'website',
    siteName: 'MINTOONS',
  },
  robots: {
    index: false,
    follow: false,
  },
};

async function getMentorManagementData(searchParams: any) {
  await connectDB();

  const page = parseInt(searchParams.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build query based on filters
  let query: any = { role: 'mentor' };

  if (searchParams.status === 'active') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.lastActiveAt = { $gte: weekAgo };
  } else if (searchParams.status === 'inactive') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.lastActiveAt = { $lt: weekAgo };
  } else if (searchParams.status === 'new') {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    query.createdAt = { $gte: monthAgo };
  }

  if (searchParams.search) {
    query.$or = [
      { firstName: { $regex: searchParams.search, $options: 'i' } },
      { lastName: { $regex: searchParams.search, $options: 'i' } },
      { email: { $regex: searchParams.search, $options: 'i' } },
    ];
  }

  // Sort options
  let sort: any = { createdAt: -1 };
  if (searchParams.sort === 'name') sort = { firstName: 1, lastName: 1 };
  else if (searchParams.sort === 'students')
    sort = { 'assignedStudents.length': -1 };
  else if (searchParams.sort === 'active') sort = { lastActiveAt: -1 };

  const [mentorsRaw, totalMentors, unassignedStudentsRaw, recentComments] =
    await Promise.all([
      User.find(query)
        .populate(
          'assignedStudents',
          'firstName lastName email age storyCount level'
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean<UserType[]>(),

      User.countDocuments(query),

      // Get students who don't have mentors assigned
      User.find({
        role: 'child',
        isActive: true,
        _id: {
          $nin: await User.distinct('assignedStudents', { role: 'mentor' }),
        },
      })
        .select('firstName lastName email age subscriptionTier storyCount')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean<UserType[]>(),

      // Get recent mentoring activity
      Comment.find({ authorRole: 'mentor' })
        .populate('authorId', 'firstName lastName')
        .populate('storyId', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean<CommentType[]>(),
    ]);

  // Map mentors and assignedStudents to plain objects with string _id
  const mentors = (mentorsRaw || []).map((mentor: any) => ({
    ...mentor,
    _id: mentor._id?.toString?.() ?? '',
    assignedStudents: Array.isArray(mentor.assignedStudents)
      ? mentor.assignedStudents.map((s: any) => ({
        ...s,
        _id: s._id?.toString?.() ?? '',
      }))
      : [],
  }));

  const unassignedStudents = (unassignedStudentsRaw || []).map((student: any) => ({
    ...student,
    _id: student._id?.toString?.() ?? '',
  }));

  // Calculate mentor statistics
  const activeMentors = mentors.filter(m => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(m.lastActiveDate || 0) >= weekAgo;
  }).length;

  const totalStudentsAssigned = mentors.reduce(
    (sum, mentor) => sum + (mentor.assignedStudents?.length || 0),
    0
  );

  const avgStudentsPerMentor =
    mentors.length > 0 ? Math.round(totalStudentsAssigned / mentors.length) : 0;

  return {
    mentors,
    unassignedStudents,
    recentComments,
    pagination: {
      page,
      limit,
      total: totalMentors,
      totalPages: Math.ceil(totalMentors / limit),
    },
    statistics: {
      total: totalMentors,
      active: activeMentors,
      unassignedStudents: unassignedStudents.length,
      avgStudentsPerMentor,
      totalStudentsAssigned,
    },
    filters: {
      status: searchParams.status || 'all',
      sort: searchParams.sort || 'created',
      search: searchParams.search || '',
    },
  };
}

interface PageProps {
  searchParams: {
    page?: string;
    status?: string;
    sort?: string;
    search?: string;
  };
}

export default async function MentorManagementPage({
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/mentors');
  }

  if (session.user.role !== 'admin') {
    redirect('/unauthorized?role=admin');
  }

  const mentorData = await getMentorManagementData(searchParams);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <MentorManagementClient
        mentors={mentorData.mentors}
        unassignedStudents={mentorData.unassignedStudents}
        recentComments={mentorData.recentComments}
        pagination={mentorData.pagination}
        statistics={mentorData.statistics}
        filters={mentorData.filters}
      />
    </Suspense>
  );
}
