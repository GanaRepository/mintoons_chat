// app/(mentor)/student-stories/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import StudentStoriesClient from './student-stories';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Comment from '@models/Comment';

export const metadata: Metadata = {
 title: 'Student Stories',
 description: 'Review and provide feedback on your assigned students\' stories.',
};

async function getStudentStoriesData(mentorId: string, searchParams: any) {
  await connectDB();

  let mentor = await User.findById(mentorId)
    .select('-password')
    .populate('assignedStudents', 'name email age')
    .lean();

  // Defensive: sometimes Mongoose returns an array, ensure it's an object
  if (Array.isArray(mentor)) {
    mentor = mentor[0];
  }

  if (!mentor || typeof mentor !== 'object' || mentor.role !== 'mentor') {
    return null;
  }

  // Defensive: assignedStudents may be missing or not an array
  const assignedStudents = Array.isArray(mentor.assignedStudents)
    ? mentor.assignedStudents
    : [];

  const studentIds = assignedStudents.map((s: any) => s._id) || [];

 // Build query based on filters
 let query: any = { authorId: { $in: studentIds } };
 
 const filter = searchParams.filter;
 const student = searchParams.student;
 const status = searchParams.status;

 if (filter === 'pending') {
   query.needsMentorReview = true;
   query.status = 'published';
 } else if (filter === 'recent') {
   const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
   query.createdAt = { $gte: weekAgo };
 }

 if (student) {
   query.authorId = student;
 }

 if (status && status !== 'all') {
   query.status = status;
 }

 const [stories, myComments] = await Promise.all([
   Story.find(query)
     .populate('authorId', 'name age email')
     .sort({ updatedAt: -1 })
     .limit(50)
     .lean(),
   
   Comment.find({ 
     commenterId: mentorId,
     storyId: { $in: [] } // Will be populated after we get story IDs
   }).lean()
 ]);

 // Get comments for these stories
 const storyIds = stories.map(s => s._id);
 const comments = await Comment.find({ 
   storyId: { $in: storyIds }
 })
   .populate('commenterId', 'name role')
   .sort({ createdAt: 1 })
   .lean();

 // Group comments by story
 const commentsByStory = comments.reduce((acc, comment) => {
   const storyId = comment.storyId.toString();
   if (!acc[storyId]) acc[storyId] = [];
   acc[storyId].push(comment);
   return acc;
 }, {} as Record<string, any[]>);

  // Map stories to strict Story type
  const safeStories = Array.isArray(stories)
    ? stories.map((s: any) => ({
        _id: s._id?.toString() || '',
        title: s.title || '',
        content: s.content || '',
        elements: s.elements || {
          genre: '', setting: '', character: '', mood: '', conflict: '', theme: ''
        },
        status: s.status || 'draft',
        authorId: typeof s.authorId === 'string' ? s.authorId : (s.authorId?._id?.toString() || ''),
        authorName: (typeof s.authorId === 'object' && s.authorId?.name) ? s.authorId.name : (s.authorName || ''),
        authorAge: (typeof s.authorId === 'object' && s.authorId?.age) ? s.authorId.age : (s.authorAge || 0),
        wordCount: s.wordCount || 0,
        readingTime: s.readingTime || 0,
        aiTurns: s.aiTurns || [],
        currentTurn: s.currentTurn || 0,
        assessment: s.assessment,
        isPublic: typeof s.isPublic === 'boolean' ? s.isPublic : false,
        likes: s.likes || 0,
        likedBy: Array.isArray(s.likedBy) ? s.likedBy : [],
        views: s.views || 0,
        viewedBy: Array.isArray(s.viewedBy) ? s.viewedBy : [],
        mentorId: s.mentorId || '',
        mentorComments: Array.isArray(s.mentorComments) ? s.mentorComments : [],
        hasUnreadComments: typeof s.hasUnreadComments === 'boolean' ? s.hasUnreadComments : false,
        isModerated: typeof s.isModerated === 'boolean' ? s.isModerated : false,
        moderationFlags: Array.isArray(s.moderationFlags) ? s.moderationFlags : [],
        excerpt: s.excerpt || '',
        ageGroup: s.ageGroup || '',
        isCompleted: typeof s.isCompleted === 'boolean' ? s.isCompleted : false,
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        publishedAt: s.publishedAt ? new Date(s.publishedAt) : undefined,
        completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
      }))
    : [];

  return {
    mentor: mentor as any, // will be type-checked at usage
    students: assignedStudents as any[],
    stories: safeStories,
    commentsByStory,
    filters: {
      filter: filter || 'all',
      student: student || 'all',
      status: status || 'all',
    },
  };
}

interface PageProps {
 searchParams: {
   filter?: string;
   student?: string;
   status?: string;
   search?: string;
 };
}

export default async function StudentStoriesPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/student-stories');
  }

  const storiesData = await getStudentStoriesData(session.user._id, searchParams);

  if (!storiesData) {
    redirect('/unauthorized?role=mentor');
  }

  // Defensive: ensure correct types for props
  const { mentor, students, stories, commentsByStory, filters } = storiesData;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <StudentStoriesClient
        mentor={mentor as any}
        students={Array.isArray(students) ? students : []}
        stories={Array.isArray(stories) ? stories : []}
        commentsByStory={commentsByStory}
        filters={filters}
      />
    </Suspense>
  );
}