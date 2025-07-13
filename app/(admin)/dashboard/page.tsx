// app/(admin)/dashboard/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Subscription from '@models/Subscription';
import Analytics from '@models/Analytics';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description:
    'Platform overview, analytics, and management controls for MINTOONS administrators.',
};

async function getAdminDashboardData() {
  await connectDB();

  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    newUsersToday,
    newUsersWeek,
    newUsersMonth,
    activeUsersWeek,
    totalStories,
    storiesThisWeek,
    storiesThisMonth,
    publishedStories,
    totalMentors,
    activeMentors,
    totalSubscriptions,
    revenueThisMonth,
    flaggedContent,
    recentUsers,
    recentStories,
    topPerformers,
  ] = await Promise.all([
    User.countDocuments({ role: 'child' }),
    User.countDocuments({
      role: 'child',
      createdAt: { $gte: today },
    }),
    User.countDocuments({
      role: 'child',
      createdAt: { $gte: last7Days },
    }),
    User.countDocuments({
      role: 'child',
      createdAt: { $gte: last30Days },
    }),
    User.countDocuments({
      role: 'child',
      lastActiveAt: { $gte: last7Days },
    }),
    Story.countDocuments(),
    Story.countDocuments({
      createdAt: { $gte: last7Days },
    }),
    Story.countDocuments({
      createdAt: { $gte: last30Days },
    }),
    Story.countDocuments({
      status: 'published',
    }),
    User.countDocuments({ role: 'mentor' }),
    User.countDocuments({
      role: 'mentor',
      lastActiveAt: { $gte: last7Days },
    }),
    Subscription.countDocuments({
      status: 'active',
      tier: { $ne: 'FREE' },
    }),
    Subscription.aggregate([
      {
        $match: {
          status: 'active',
          currentPeriodStart: { $gte: last30Days },
        },
      },
      {
        $lookup: {
          from: 'subscriptiontiers',
          localField: 'tier',
          foreignField: '_id',
          as: 'tierInfo',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$monthlyAmount' },
        },
      },
    ]),
    Story.countDocuments({
      status: 'published',
      flaggedBy: { $exists: true, $ne: [] },
    }),
    User.find({ role: 'child' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email age createdAt subscriptionTier')
      .lean(),
    Story.find()
      .populate('authorId', 'name age')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    User.find({ role: 'child' })
      .sort({ points: -1 })
      .limit(5)
      .select('name age points level storyCount')
      .lean(),
  ]);

  // Calculate growth rates
  const userGrowthRate =
    newUsersMonth > 0
      ? Math.round(((newUsersWeek * 4) / newUsersMonth) * 100)
      : 0;

  const storyGrowthRate =
    storiesThisMonth > 0
      ? Math.round(((storiesThisWeek * 4) / storiesThisMonth) * 100)
      : 0;

  const revenue = revenueThisMonth[0]?.totalRevenue || 0;

  return {
    statistics: {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        newThisMonth: newUsersMonth,
        activeThisWeek: activeUsersWeek,
        growthRate: userGrowthRate,
      },
      stories: {
        total: totalStories,
        thisWeek: storiesThisWeek,
        thisMonth: storiesThisMonth,
        published: publishedStories,
        growthRate: storyGrowthRate,
      },
      mentors: {
        total: totalMentors,
        active: activeMentors,
      },
      revenue: {
        thisMonth: revenue,
        subscriptions: totalSubscriptions,
      },
      moderation: {
        flagged: flaggedContent,
      },
    },
    recentUsers,
    recentStories,
    topPerformers,
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  const dashboardData = await getAdminDashboardData();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <AdminDashboardClient
        statistics={dashboardData.statistics}
        recentUsers={dashboardData.recentUsers}
        recentStories={dashboardData.recentStories}
        topPerformers={dashboardData.topPerformers}
      />
    </Suspense>
  );
}
