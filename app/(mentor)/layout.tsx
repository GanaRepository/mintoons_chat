// app/(mentor)/layout.tsx - Mentor Layout
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { MentorSidebar } from '@components/layout/MentorSidebar';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';

export const metadata: Metadata = {
  title: {
    template: '%s | Mentor Dashboard - MINTOONS',
    default: 'Mentor Dashboard | MINTOONS',
  },
  description: 'MINTOONS mentor dashboard. Review student stories, provide feedback, and track progress.',
  robots: {
    index: false,
    follow: false,
  },
};

async function getMentorData(userId: string) {
  await connectDB();

  let mentor = await User.findById(userId)
    .select('-password')
    .populate('assignedStudents', 'name email age storyCount level')
    .lean();

  // Defensive: sometimes Mongoose returns an array, ensure it's an object
  if (Array.isArray(mentor)) {
    mentor = mentor[0];
  }

  if (!mentor || typeof mentor !== 'object' || mentor.role !== 'mentor') {
    return null;
  }

  return mentor;
}

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/mentor-dashboard');
  }

  let mentor = await getMentorData(session.user._id);

  if (!mentor) {
    redirect('/unauthorized?role=mentor');
  }

  // Defensive: ensure mentor is correct shape for MentorSidebar
  mentor = { ...mentor };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <MentorSidebar isOpen={true} />
        </aside>

        {/* Main content */}
        <div className="lg:pl-72 flex-1">
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}