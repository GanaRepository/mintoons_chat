import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'featured';
    const genre = searchParams.get('genre');
    const ageGroup = searchParams.get('ageGroup');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Base query for public stories
    let query: any = {
      status: 'published',
      isDeleted: { $ne: true },
      isPublic: true, // Only show stories marked as public
      'aiAssessment.overallScore': { $gte: 75 } // Only well-rated stories
    };

    // Add genre filter
    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    // Add age group filter
    if (ageGroup) {
      const [minAge, maxAge] = ageGroup.split('-').map(Number);
      query['$lookup'] = {
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author',
        pipeline: [
          { $match: { age: { $gte: minAge, $lte: maxAge } } }
        ]
      };
    }

    // Category-specific queries
    let sortCriteria: any = {};
    switch (category) {
      case 'featured':
        query.isFeatured = true;
        sortCriteria = { featuredAt: -1, 'aiAssessment.overallScore': -1 };
        break;
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'popular':
        sortCriteria = { viewCount: -1, createdAt: -1 };
        break;
      case 'top-rated':
        sortCriteria = { 'aiAssessment.overallScore': -1, viewCount: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const stories = await Story.find(query)
      .populate('authorId', 'firstName lastName age')
      .select('title content genre createdAt wordCount readingTime aiAssessment viewCount isFeatured')
      .sort(sortCriteria)
      .limit(limit)
      .lean();

    // Process stories for public display
    const publicStories = stories.map(story => ({
      _id: story._id,
      title: story.title,
      preview: story.content.substring(0, 150) + (story.content.length > 150 ? '...' : ''),
      genre: story.genre,
      authorName: `${story.authorId.firstName} ${story.authorId.lastName.charAt(0)}.`, // Privacy-friendly
      authorAge: story.authorId.age,
      createdAt: story.createdAt,
      wordCount: story.wordCount,
      readingTime: story.readingTime,
      rating: story.aiAssessment?.overallScore || 0,
      viewCount: story.viewCount || 0,
      isFeatured: story.isFeatured || false
    }));

    return NextResponse.json({
      stories: publicStories,
      category,
      totalFound: publicStories.length
    });

  } catch (error) {
    console.error('Error fetching public stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}