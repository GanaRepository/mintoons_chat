import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import UserManagementClient, { UserWithStats } from './UserManagementClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import UserModel from '@models/User';
import type { User } from '../../../types/user';
import Story from '@models/Story';

export const metadata: Metadata = {
  title: 'User Management',
  description:
    'Manage platform users, view analytics, and perform administrative actions.',
};

async function getUserManagementData(searchParams: any) {
  await connectDB();

  const page = parseInt(searchParams.page) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  // Build query based on filters
  let query: any = { role: 'child' };

  if (searchParams.status === 'active') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.lastActiveDate = { $gte: weekAgo };
  } else if (searchParams.status === 'inactive') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.lastActiveDate = { $lt: weekAgo };
  }

  if (searchParams.tier && searchParams.tier !== 'all') {
    query.subscriptionTier = searchParams.tier;
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
  else if (searchParams.sort === 'stories') sort = { storyCount: -1 };
  else if (searchParams.sort === 'points') sort = { totalPoints: -1 };
  else if (searchParams.sort === 'active') sort = { lastActiveDate: -1 };

  const [users, totalUsers, totalStories] = await Promise.all([
    UserModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password')
      .lean(),

    UserModel.countDocuments(query),

    Story.aggregate([{ $group: { _id: '$authorId', count: { $sum: 1 } } }]),
  ]);

  // Add story counts and computed fields to users
  const storyCountMap = totalStories.reduce(
    (acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id.toString()] = item.count;
      return acc;
    },
    {} as Record<string, number>
  );

  const usersWithStats: UserWithStats[] = users.map((user: any) => ({
    ...user,
    storyCount: storyCountMap[user._id?.toString() ?? ''] || 0,
    name: `${user.firstName} ${user.lastName}`,
    points: user.totalPoints,
  }));

  // Calculate summary statistics
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const activeUsers = usersWithStats.filter((u) => {
    return new Date(u.lastActiveDate || 0) >= weekAgo;
  }).length;

  const newUsersThisMonth = usersWithStats.filter((u) => {
    return new Date(u.createdAt) >= monthAgo;
  }).length;

  return {
    users: usersWithStats,
    pagination: {
      page,
      limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
    statistics: {
      total: totalUsers,
      active: activeUsers,
      newThisMonth: newUsersThisMonth,
      averageStories: Math.round(
        usersWithStats.reduce((sum, u) => sum + u.storyCount, 0) /
          Math.max(usersWithStats.length, 1)
      ),
    },
    filters: {
      status: searchParams.status || 'all',
      tier: searchParams.tier || 'all',
      sort: searchParams.sort || 'created',
      search: searchParams.search || '',
    },
  };
}

interface PageProps {
  searchParams: {
    page?: string;
    status?: string;
    tier?: string;
    sort?: string;
    search?: string;
  };
}

export default async function UserManagementPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/users');
  }

  const userData = await getUserManagementData(searchParams);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <UserManagementClient
        users={userData.users}
        pagination={userData.pagination}
        statistics={userData.statistics}
        filters={userData.filters}
      />
    </Suspense>
  );
}