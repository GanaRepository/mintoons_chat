import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const genre = searchParams.get('genre');
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build search query
    let searchQuery: any = {
      status: 'published',
      isDeleted: { $ne: true },
      $text: { $search: query }
    };

    // Add filters
    if (genre && genre !== 'all') {
      searchQuery.genre = genre;
    }

    // Age-appropriate content filtering
    if (minAge || maxAge) {
      searchQuery['authorId.age'] = {};
      if (minAge) searchQuery['authorId.age'].$gte = parseInt(minAge);
      if (maxAge) searchQuery['authorId.age'].$lte = parseInt(maxAge);
    }

    // Build sort criteria
    let sortCriteria: any = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'popular':
        sortCriteria = { viewCount: -1, createdAt: -1 };
        break;
      case 'rating':
        sortCriteria = { 'aiAssessment.overallScore': -1, createdAt: -1 };
        break;
      default: // relevance
        sortCriteria = { score: { $meta: 'textScore' }, createdAt: -1 };
        break;
    }

    const [stories, total] = await Promise.all([
      Story.find(searchQuery)
        .populate('authorId', 'firstName lastName age')
        .select('title content genre createdAt wordCount readingTime aiAssessment viewCount')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments(searchQuery)
    ]);

    // Add search relevance score and truncate content for preview
    const searchResults = stories.map(story => ({
      ...story,
      content: story.content.substring(0, 200) + (story.content.length > 200 ? '...' : ''),
      relevanceScore: story.score || 1
    }));

    return NextResponse.json({
      stories: searchResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      searchQuery: query,
      filters: {
        genre,
        minAge,
        maxAge,
        sortBy
      }
    });

  } catch (error) {
    console.error('Error searching stories:', error);
    return NextResponse.json(
      { error: 'Failed to search stories' },
      { status: 500 }
    );
  }
}