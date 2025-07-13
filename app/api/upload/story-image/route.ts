import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { uploadToCloudinary } from '@lib/upload/cloudinary';

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

    // Upload all files
    const uploadPromises = files.map(async (file, index) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return uploadToCloudinary(buffer, {
        folder: 'story-images',
        public_id: `story_${session.user.id}_${Date.now()}_${index}`,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    const imageUrls = uploadResults.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    }));

    return NextResponse.json({
      images: imageUrls,
      message: 'Images uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading story images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' }, 
      { status: 500 }
    );
  }
}