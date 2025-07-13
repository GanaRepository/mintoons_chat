// app/(admin)/layout.tsx - Admin Layout
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { AdminSidebar } from '@components/layout/AdminSidebar';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Dashboard - MINTOONS',
    default: 'Admin Dashboard | MINTOONS',
  },
  description: 'MINTOONS admin dashboard. Manage users, mentors, content moderation, and platform analytics.',
  robots: {
    index: false,
    follow: false,
  },
};

async function getAdminData(userId: string) {
  await connectDB();
  
  const admin = await User.findById(userId)
    .select('-password')
    .lean();
    
  if (!admin || (admin as any).role !== 'admin') {
    return null;
  }
  
  return admin;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  const admin = await getAdminData(session.user._id);
  
  if (!admin) {
    redirect('/unauthorized?role=admin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <AdminSidebar isOpen={true} />
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