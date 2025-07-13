import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import { contentModerationSystem } from '@lib/security/content-moderator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('type') || 'all'; // 'story', 'comment', 'all'
    const limit = parseInt(searchParams.get('limit') || '20');

    const flaggedContent = await contentModerationSystem.getFlaggedContent(
      contentType as any,
      limit
    );

    return NextResponse.json({
      flaggedContent,
      total: flaggedContent.length
    });

  } catch (error) {
    console.error('Error fetching flagged content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flagged content' }, 
      { status: 500 }
    );
  }
}