// app/(admin)/users/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import UserManagementClient from './UserManagementClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';

export const metadata: Metadata = {
  title: 'User Management',
  description: 'Manage platform users, view analytics, and perform administrative actions.',
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
    query.lastActiveAt = { $gte: weekAgo };
  } else if (searchParams.status === 'inactive') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.lastActiveAt = { $lt: weekAgo };
  }

  if (searchParams.tier && searchParams.tier !== 'all') {
    query.subscriptionTier = searchParams.tier;
  }

  if (searchParams.search) {
    query.$or = [
      { name: { $regex: searchParams.search, $options: 'i' } },
      { email: { $regex: searchParams.search, $options: 'i' } }
    ];
  }

  // Sort options
  let sort: any = { createdAt: -1 };
  if (searchParams.sort === 'name') sort = { name: 1 };
  else if (searchParams.sort === 'stories') sort = { storyCount: -1 };
  else if (searchParams.sort === 'points') sort = { points: -1 };
  else if (searchParams.sort === 'active') sort = { lastActiveAt: -1 };

  const [users, totalUsers, totalStories] = await Promise.all([
    User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password')
      .lean(),
    
    User.countDocuments(query),
    
    Story.aggregate([
      { $group: { _id: '$authorId', count: { $sum: 1 } } }
    ])
  ]);

  // Add story counts to users
  const storyCountMap = totalStories.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {} as Record<string, number>);

  const usersWithStats = users.map(user => ({
    ...user,
    storyCount: storyCountMap[user._id.toString()] || 0,
  }));

  // Calculate summary statistics
  const activeUsers = users.filter(u => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(u.lastActiveAt || 0) >= weekAgo;
  }).length;

  const newUsersThisMonth = users.filter(u => {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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
        usersWithStats.reduce((sum, u) => sum + u.storyCount, 0) / Math.max(usersWithStats.length, 1)
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
        <div className="flex justify-center items-center min-h-[400px]">
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