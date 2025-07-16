// app/(dashboard)/layout.tsx - Dashboard Layout with Sidebar
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { Sidebar } from '@components/layout/Sidebar';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard - MINTOONS',
    default: 'Dashboard | MINTOONS',
  },
  description: 'Your personal MINTOONS dashboard. Create stories, track progress, and explore your writing journey.',
  robots: {
    index: false,
    follow: false,
  },
};

async function getUserData(userId: string) {
  await connectDB();
  const userDoc = await User.findById(userId)
    .select('-password')
    .lean();
  if (!userDoc) return null;
  // Map to plain object with string _id
  return {
    ...userDoc,
    _id: userDoc._id?.toString?.() ?? '',
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/user-dashboard');
  }

  // Get fresh user data
  const userData = await getUserData(session.user._id);

  if (!userData) {
    redirect('/login?error=SessionExpired');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <Sidebar isOpen={true} />
        </aside>

        {/* Main content */}
        <div className="lg:pl-72 flex-1">
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}