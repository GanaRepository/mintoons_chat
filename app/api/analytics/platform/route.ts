import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Subscription from '@models/Subscription';
import Analytics from '@models/Analytics';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30days';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get platform-wide analytics
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalStories,
      publishedStories,
      totalRevenue,
      activeSubscriptions,
      userGrowth,
      storyGrowth,
      revenueGrowth
    ] = await Promise.all([
      User.countDocuments({ role: 'child' }),
      User.countDocuments({ 
        role: 'child',
        lastActiveAt: { $gte: startDate }
      }),
      User.countDocuments({ 
        role: 'child',
        createdAt: { $gte: startDate }
      }),
      Story.countDocuments({ isDeleted: { $ne: true } }),
      Story.countDocuments({ status: 'published', isDeleted: { $ne: true } }),
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$monthlyAmount' } } }
      ]),
      Subscription.countDocuments({ status: 'active' }),
      
      // Growth data
      User.aggregate([
        {
          $match: {
            role: 'child',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      Story.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      Subscription.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'active'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$monthlyAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    // Format growth data
    const formatGrowthData = (data: any[], valueKey: string = 'count') => {
      return data.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        value: item[valueKey]
      }));
    };

    return NextResponse.json({
      summary: {
        totalUsers,
        activeUsers,
        newUsers,
        totalStories,
        publishedStories,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeSubscriptions,
        userGrowthRate: ((newUsers / Math.max(totalUsers - newUsers, 1)) * 100).toFixed(1)
      },
      growth: {
        users: formatGrowthData(userGrowth),
        stories: formatGrowthData(storyGrowth),
        revenue: formatGrowthData(revenueGrowth, 'revenue')
      }
    });

  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform analytics' }, 
      { status: 500 }
    );
  }
}