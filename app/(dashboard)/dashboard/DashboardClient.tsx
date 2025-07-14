// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import {
//   BookOpen,
//   TrendingUp,
//   Award,
//   Target,
//   Plus,
//   Eye,
//   Calendar,
//   Sparkles,
//   Crown,
//   Star,
//   ArrowRight,
//   BarChart3,
//   Users,
//   Zap,
// } from 'lucide-react';
// import { MdWhatshot } from 'react-icons/md';

// import { Button } from '@components/ui/button';
// import { Card } from '@components/ui/card';
// import { Badge } from '@components/ui/badge';
// import { ProgressBar } from '@components/ui/progress-bar';
// import { StoryCard } from '@components/stories/StoryCard';
// import { UsageIndicator } from '@components/subscription/UsageIndicator';
// import { AchievementBadge } from '@components/gamification/AchievementBadge';
// import { StreakCounter } from '@components/gamification/StreakCounter';
// import { FadeIn } from '@components/animations/FadeIn';
// import { SlideIn } from '@components/animations/SlideIn';

// import { formatDate } from '@utils/formatters';
// import { getGreeting } from '@utils/helpers';
// import type { User } from '@/types/user';
// import type { Story } from '@/types/story';

// interface DashboardProps {
//   user: User;
//   recentStories: Story[];
//   subscription: {
//     tier: string;
//     storyLimit: number;
//     storiesUsed: number;
//     storiesRemaining: number;
//   };
// }

// export default function DashboardClient({
//   user,
//   recentStories,
//   subscription,
// }: DashboardProps) {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     const timer = setInterval(() => setCurrentTime(new Date()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   if (!mounted) {
//     return <div>Loading...</div>;
//   }

//   const greeting = getGreeting();

//   // Quick stats
//   const stats = [
//     {
//       label: 'Stories Written',
//       value: subscription.storiesUsed,
//       icon: BookOpen,
//       color: 'from-blue-500 to-cyan-500',
//       change: '+2 this week',
//     },
//     {
//       label: 'Writing Streak',
//       value: user.streak || 0,
//       icon: MdWhatshot,
//       color: 'from-orange-500 to-red-500',
//       change: user.streak > 0 ? 'Keep it up!' : 'Start today',
//     },
//     {
//       label: 'Achievement Score',
//       value: user.totalPoints || 0,
//       icon: Star,
//       color: 'from-purple-500 to-pink-500',
//       change: `Level ${user.level || 1}`,
//     },
//     {
//       label: 'Stories Remaining',
//       value: subscription.storiesRemaining,
//       icon: Target,
//       color: 'from-green-500 to-emerald-500',
//       change: `${subscription.tier} plan`,
//     },
//   ];

//   // Recent achievements (mock data - would come from user.achievements)
//   const recentAchievements = [
//     {
//       id: 'first_story',
//       title: 'First Story',
//       description: 'Completed your very first story!',
//       icon: '🎉',
//       unlockedAt: new Date(Date.now() - 86400000), // Yesterday
//     },
//     {
//       id: 'creative_writer',
//       title: 'Creative Writer',
//       description: 'Used 5 different genres in your stories',
//       icon: '🎨',
//       unlockedAt: new Date(Date.now() - 172800000), // 2 days ago
//     },
//   ];

//   return (
//     <div className="space-y-8">
//       {/* Welcome Header */}
//       <FadeIn>
//         <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white">
//           {/* ...header code unchanged... */}
//           <div className="relative z-10">
//             <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2">
//                   <span className="text-2xl">👋</span>
//                   <h1 className="text-3xl font-bold lg:text-4xl">
//                     {greeting}, {user.fullName}!
//                   </h1>
//                 </div>
//                 <p className="text-xl text-purple-100">
//                   Ready to create another amazing story today?
//                 </p>
//                 <div className="flex flex-wrap items-center gap-4 text-sm">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4" />
//                     <span>{formatDate(currentTime)}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Crown className="h-4 w-4" />
//                     <span>{subscription.tier} Member</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex flex-col gap-3 sm:flex-row">
//                 <Link href="/dashboard/create-stories">
//                   <Button
//                     size="lg"
//                     className="bg-white font-semibold text-purple-600 hover:bg-gray-100"
//                   >
//                     <Plus className="mr-2 h-5 w-5" />
//                     Write New Story
//                   </Button>
//                 </Link>
//                 <Link href="/dashboard/my-stories">
//                   <Button
//                     size="lg"
//                     variant="outline"
//                     className="border-white text-white hover:bg-white/10"
//                   >
//                     <Eye className="mr-2 h-5 w-5" />
//                     View Stories
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </FadeIn>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
//         {stats.map((stat, index) => (
//           <FadeIn key={stat.label} delay={0.1 * index}>
//             <Card className="p-6 transition-shadow duration-300 hover:shadow-lg">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     {stat.label}
//                   </p>
//                   <p className="mt-1 text-3xl font-bold text-gray-900">
//                     {stat.value}
//                   </p>
//                   <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
//                 </div>
//                 <div
//                   className={`rounded-2xl bg-gradient-to-br p-3 ${stat.color}`}
//                 >
//                   <stat.icon className="h-6 w-6 text-white" />
//                 </div>
//               </div>
//             </Card>
//           </FadeIn>
//         ))}
//       </div>

//       <div className="grid gap-8 lg:grid-cols-3">
//         {/* Main Content */}
//         <div className="space-y-8 lg:col-span-2">
//           {/* Usage Progress */}
//           <FadeIn delay={0.3}>
//             <UsageIndicator
//               user={user}
//               showDetails={true}
//               className="bg-white"
//             />
//           </FadeIn>

//           {/* Recent Stories */}
//           <SlideIn direction="up" delay={0.4}>
//             <Card className="p-6">
//               <div className="mb-6 flex items-center justify-between">
//                 <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
//                   <BookOpen className="h-6 w-6 text-purple-600" />
//                   Recent Stories
//                 </h2>
//                 {recentStories.length > 0 && (
//                   <Link href="/dashboard/my-stories">
//                     <Button variant="outline" size="sm">
//                       View All
//                       <ArrowRight className="ml-2 h-4 w-4" />
//                     </Button>
//                   </Link>
//                 )}
//               </div>
//               {recentStories.length === 0 ? (
//                 <div className="py-12 text-center">
//                   <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-purple-100">
//                     <BookOpen className="h-12 w-12 text-purple-600" />
//                   </div>
//                   <h3 className="mb-2 text-lg font-semibold text-gray-900">
//                     No Stories Yet
//                   </h3>
//                   <p className="mb-6 text-gray-600">
//                     Start your writing journey by creating your first story!
//                   </p>
//                   <Link href="/dashboard/create-stories">
//                     <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
//                       <Sparkles className="mr-2 h-4 w-4" />
//                       Create Your First Story
//                     </Button>
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {recentStories.slice(0, 3).map(story => (
//                     <StoryCard
//                       key={story._id}
//                       story={story}
//                       currentUser={user}
//                       variant="compact"
//                       showActions={false}
//                     />
//                   ))}
//                 </div>
//               )}
//             </Card>
//           </SlideIn>

//           {/* Quick Actions */}
//           <SlideIn direction="up" delay={0.5}>
//             <Card className="p-6">
//               <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
//                 <Zap className="h-6 w-6 text-yellow-500" />
//                 Quick Actions
//               </h2>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <Link href="/dashboard/create-stories">
//                   <div className="group cursor-pointer rounded-lg border-2 border-dashed border-purple-300 p-4 transition-colors hover:border-purple-500 hover:bg-purple-50">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200">
//                         <Plus className="h-5 w-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">
//                           New Story
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           Start writing with AI
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>

//                 <Link href="/dashboard/progress">
//                   <div className="group cursor-pointer rounded-lg border-2 border-dashed border-blue-300 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
//                         <BarChart3 className="h-5 w-5 text-blue-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">
//                           View Progress
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           See your achievements
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>

//                 <Link href="/explore-stories">
//                   <div className="group cursor-pointer rounded-lg border-2 border-dashed border-green-300 p-4 transition-colors hover:border-green-500 hover:bg-green-50">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200">
//                         <Users className="h-5 w-5 text-green-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">
//                           Explore Stories
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           Read others' stories
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>

//                 <Link href="/dashboard/profile">
//                   <div className="group cursor-pointer rounded-lg border-2 border-dashed border-orange-300 p-4 transition-colors hover:border-orange-500 hover:bg-orange-50">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200">
//                         <Crown className="h-5 w-5 text-orange-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">Profile</h3>
//                         <p className="text-sm text-gray-600">
//                           Manage your account
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             </Card>
//           </SlideIn>
//         </div>

//         {/* Sidebar Content */}
//         <div className="space-y-6">
//           {/* Writing Streak */}
//           <FadeIn delay={0.6}>
//             <StreakCounter
//               currentStreak={user.streak}
//               longestStreak={user.streak}
//               lastWritingDate={user.lastActiveDate}
//             />
//           </FadeIn>

//           {/* Recent Achievements */}
//           <SlideIn direction="right" delay={0.7}>
//             <Card className="p-6">
//               <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
//                 <Award className="h-5 w-5 text-yellow-500" />
//                 Recent Achievements
//               </h3>

//               {recentAchievements.length === 0 ? (
//                 <div className="py-6 text-center">
//                   <div className="mb-2 text-4xl">🎯</div>
//                   <p className="text-sm text-gray-600">
//                     Start writing to unlock achievements!
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {recentAchievements.map(achievement => (
//                     <AchievementBadge
//                       key={achievement.id}
//                       achievement={achievement}
//                       size="sm"
//                       showDate={true}
//                     />
//                   ))}
//                 </div>
//               )}

//               <Link href="/dashboard/progress">
//                 <Button variant="outline" size="sm" className="mt-4 w-full">
//                   View All Achievements
//                 </Button>
//               </Link>
//             </Card>
//           </SlideIn>

//           {/* Tips & Motivation */}
//           <SlideIn direction="right" delay={0.8}>
//             <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
//               <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
//                 <Sparkles className="h-5 w-5 text-purple-600" />
//                 Writing Tip
//               </h3>

//               <div className="space-y-3">
//                 <p className="text-sm text-gray-700">
//                   💡 <strong>Today's Tip:</strong> Try describing what your
//                   character sees, hears, and feels to make your story more
//                   exciting!
//                 </p>

//                 <div className="rounded-lg border border-purple-200 bg-white p-3">
//                   <p className="mb-1 text-xs text-gray-600">Example:</p>
//                   <p className="text-sm italic text-gray-700">
//                     "Sarah heard the mysterious whispers coming from the old oak
//                     tree..."
//                   </p>
//                 </div>
//               </div>
//             </Card>
//           </SlideIn>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Plus,
  Eye,
  Calendar,
  Sparkles,
  Crown,
  Star,
  ArrowRight,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';
import { MdWhatshot } from 'react-icons/md';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import { StoryCard } from '@components/stories/StoryCard';
import { UsageIndicator } from '@components/subscription/UsageIndicator';
import { AchievementBadge } from '@components/gamification/AchievementBadge';
import { StreakCounter } from '@components/gamification/StreakCounter';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { formatDate } from '@utils/formatters';
import { getGreeting } from '@utils/helpers';
import type { User } from '@/types/user';
import type { Story } from '@/types/story';

// MINIMAL FIX: Add Achievement interface for the component
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

interface DashboardProps {
  user: User;
  recentStories: Story[];
  subscription: {
    tier: string;
    storyLimit: number;
    storiesUsed: number;
    storiesRemaining: number;
  };
}

export default function DashboardClient({
  user,
  recentStories,
  subscription,
}: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  const greeting = getGreeting();

  // Quick stats
  const stats = [
    {
      label: 'Stories Written',
      value: subscription.storiesUsed,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      change: '+2 this week',
    },
    {
      label: 'Writing Streak',
      value: user.streak || 0,
      icon: MdWhatshot,
      color: 'from-orange-500 to-red-500',
      change: user.streak > 0 ? 'Keep it up!' : 'Start today',
    },
    {
      label: 'Achievement Score',
      value: user.totalPoints || 0,
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      change: `Level ${user.level || 1}`,
    },
    {
      label: 'Stories Remaining',
      value: subscription.storiesRemaining,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      change: `${subscription.tier} plan`,
    },
  ];

  const recentAchievements = [
  {
    id: 'first_story',
    name: 'First Story',
    title: 'First Story',
    description: 'Completed your very first story!',
    icon: '🎉',
    unlockedAt: new Date(Date.now() - 86400000),
    type: 'milestone',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'creative_writer',
    name: 'Creative Writer',
    title: 'Creative Writer',
    description: 'Used 5 different genres in your stories',
    icon: '🎨',
    unlockedAt: new Date(Date.now() - 172800000),
    type: 'milestone',
    rarity: 'rare',
    points: 20,
  },
];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white">
          {/* ...header code unchanged... */}
          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👋</span>
                  <h1 className="text-3xl font-bold lg:text-4xl">
                    {greeting}, {user.fullName || `${user.firstName} ${user.lastName}`}!
                  </h1>
                </div>
                <p className="text-xl text-purple-100">
                  Ready to create another amazing story today?
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(currentTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    <span>{subscription.tier} Member</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/create-stories">
                  <Button
                    size="lg"
                    className="bg-white font-semibold text-purple-600 hover:bg-gray-100"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Write New Story
                  </Button>
                </Link>
                <Link href="/dashboard/my-stories">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    View Stories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.1 * index}>
            <Card className="p-6 transition-shadow duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
                </div>
                <div
                  className={`rounded-2xl bg-gradient-to-br p-3 ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Usage Progress */}
          <FadeIn delay={0.3}>
            <UsageIndicator
              user={user}
              showDetails={true}
              className="bg-white"
            />
          </FadeIn>

          {/* Recent Stories */}
          <SlideIn direction="up" delay={0.4}>
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  Recent Stories
                </h2>
                {recentStories.length > 0 && (
                  <Link href="/dashboard/my-stories">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              {recentStories.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-purple-100">
                    <BookOpen className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No Stories Yet
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Start your writing journey by creating your first story!
                  </p>
                  <Link href="/dashboard/create-stories">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Your First Story
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStories.slice(0, 3).map(story => (
                    <StoryCard
                      key={story._id}
                      story={story}
                      currentUser={user}
                      variant="compact"
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </Card>
          </SlideIn>

          {/* Quick Actions */}
          <SlideIn direction="up" delay={0.5}>
            <Card className="p-6">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Zap className="h-6 w-6 text-yellow-500" />
                Quick Actions
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/dashboard/create-stories">
                  <div className="group cursor-pointer rounded-lg border-2 border-dashed border-purple-300 p-4 transition-colors hover:border-purple-500 hover:bg-purple-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200">
                        <Plus className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          New Story
                        </h3>
                        <p className="text-sm text-gray-600">
                          Start writing with AI
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/progress">
                  <div className="group cursor-pointer rounded-lg border-2 border-dashed border-blue-300 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          View Progress
                        </h3>
                        <p className="text-sm text-gray-600">
                          See your achievements
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/explore-stories">
                  <div className="group cursor-pointer rounded-lg border-2 border-dashed border-green-300 p-4 transition-colors hover:border-green-500 hover:bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Explore Stories
                        </h3>
                        <p className="text-sm text-gray-600">
                          Read others' stories
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/profile">
                  <div className="group cursor-pointer rounded-lg border-2 border-dashed border-orange-300 p-4 transition-colors hover:border-orange-500 hover:bg-orange-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200">
                        <Crown className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Profile</h3>
                        <p className="text-sm text-gray-600">
                          Manage your account
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          </SlideIn>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Writing Streak - MINIMAL FIX */}
          <FadeIn delay={0.6}>
            <StreakCounter
              currentStreak={user.streak || 0}
              longestStreak={user.streak || 0}
              lastWritingDate={user.lastActiveDate || undefined}
            />
          </FadeIn>

          {/* Recent Achievements */}
          <SlideIn direction="right" delay={0.7}>
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Award className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </h3>

              {recentAchievements.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="mb-2 text-4xl">🎯</div>
                  <p className="text-sm text-gray-600">
                    Start writing to unlock achievements!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAchievements.map(achievement => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="sm"
                      showDate={true}
                    />
                  ))}
                </div>
              )}

              <Link href="/dashboard/progress">
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View All Achievements
                </Button>
              </Link>
            </Card>
          </SlideIn>

          {/* Tips & Motivation */}
          <SlideIn direction="right" delay={0.8}>
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Writing Tip
              </h3>

              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  💡 <strong>Today's Tip:</strong> Try describing what your
                  character sees, hears, and feels to make your story more
                  exciting!
                </p>

                <div className="rounded-lg border border-purple-200 bg-white p-3">
                  <p className="mb-1 text-xs text-gray-600">Example:</p>
                  <p className="text-sm italic text-gray-700">
                    "Sarah heard the mysterious whispers coming from the old oak
                    tree..."
                  </p>
                </div>
              </div>
            </Card>
          </SlideIn>
        </div>
      </div>
    </div>
  );
}