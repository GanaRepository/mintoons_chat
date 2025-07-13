import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Comment from '@models/Comment';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'mentor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const filter = searchParams.get('filter'); // 'pending', 'recent', 'all'
    const studentId = searchParams.get('student');

    // Get mentor's assigned students
    const mentor = await User.findById(session.user.id).select('assignedStudents');
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const assignedStudentIds = mentor.assignedStudents || [];
    
    // Build query
    let query: any = {
      authorId: { $in: assignedStudentIds },
      isDeleted: { $ne: true }
    };

    if (studentId && assignedStudentIds.includes(studentId)) {
      query.authorId = studentId;
    }

    if (filter === 'pending') {
      query.needsMentorReview = true;
      query.status = 'published';
    } else if (filter === 'recent') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: weekAgo };
    }

    const [stories, total] = await Promise.all([
      Story.find(query)
        .populate('authorId', 'firstName lastName age')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments(query)
    ]);

    // Get comment counts for each story
    const storyIds = stories.map(s => s._id);
    const commentCounts = await Comment.aggregate([
      { $match: { storyId: { $in: storyIds } } },
      { $group: { _id: '$storyId', count: { $sum: 1 } } }
    ]);

    const commentCountMap = commentCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Add comment counts to stories
    const storiesWithCounts = stories.map(story => ({
      ...story,
      commentCount: commentCountMap[story._id.toString()] || 0
    }));

    return NextResponse.json({
      stories: storiesWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching mentor stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' }, 
      { status: 500 }
    );
  }
}