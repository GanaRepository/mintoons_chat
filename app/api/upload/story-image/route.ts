import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const maxFiles = 5;

    if (files.length > maxFiles) {
      return NextResponse.json(
        { error: `Maximum ${maxFiles} files allowed` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB per file.' },
          { status: 400 }
        );
      }
    }

    // Convert files to base64 and store in MongoDB
    await connectDB();
    const imageDocs = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageDocs.push({
        data: base64,
        mimetype: file.type,
        uploadedBy: session.user._id,
        uploadedAt: new Date()
      });
    }

    // Option 1: Store as separate documents (recommended for flexibility)
    // You may want a StoryImage model, but for now, store in Story.images[]
    // If you have a storyId, you can associate images with a story
    // For demo, just insert as new story with images
    const story = new Story({
      author: session.user._id,
      images: imageDocs,
      createdAt: new Date()
    });
    await story.save();

    return NextResponse.json({
      images: imageDocs.map(img => ({
        mimetype: img.mimetype,
        uploadedAt: img.uploadedAt
      })),
      message: 'Images uploaded and stored in MongoDB successfully'
    });

  } catch (error) {
    console.error('Error uploading story images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' }, 
      { status: 500 }
    );
  }
}