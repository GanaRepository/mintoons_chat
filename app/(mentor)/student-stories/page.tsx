// app/(mentor)/student-stories/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import StudentStoriesClient from './StudentStoriesClient';
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

 const mentor = await User.findById(mentorId)
   .select('-password')
   .populate('assignedStudents', 'name email age')
   .lean();

 if (!mentor || mentor.role !== 'mentor') {
   return null;
 }

 const studentIds = mentor.assignedStudents?.map(s => s._id) || [];

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

 return {
   mentor,
   students: mentor.assignedStudents || [],
   stories,
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

 const storiesData = await getStudentStoriesData(session.user.id, searchParams);

 if (!storiesData) {
   redirect('/unauthorized?role=mentor');
 }

 return (
   <Suspense 
     fallback={
       <div className="flex justify-center items-center min-h-[400px]">
         <LoadingAnimation size="lg" />
       </div>
     }
   >
     <StudentStoriesClient 
       mentor={storiesData.mentor}
       students={storiesData.students}
       stories={storiesData.stories}
       commentsByStory={storiesData.commentsByStory}
       filters={storiesData.filters}
     />
   </Suspense>
 );
}