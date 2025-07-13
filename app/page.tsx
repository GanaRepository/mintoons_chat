// // app/page.tsx - Modern Landing Page (Fixed with proper types)
// import type { Metadata } from 'next';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Suspense } from 'react';
// import {
//   Sparkles,
//   BookOpen,
//   Users,
//   Star,
//   ArrowRight,
//   Play,
//   Shield,
//   Zap,
//   Heart,
//   Award,
//   ChevronRight,
//   CheckCircle,
//   Globe,
//   TrendingUp,
// } from 'lucide-react';

// // Components from existing codebase
// import { Button } from '@components/ui/button';
// import { Card } from '@components/ui/card';
// import { Badge } from '@components/ui/badge';
// import { FadeIn } from '@components/animations/FadeIn';
// import { SlideIn } from '@components/animations/SlideIn';
// import { TypewriterEffect } from '@components/animations/TypewriterEffect';
// import { LoadingAnimation } from '@components/animations/LoadingAnimation';
// import { SampleStoryCard } from '@components/stories/SampleStoryCard';
// import { PricingCard } from '@components/subscription/PricingCard';

// // Types and Constants from existing codebase - PROPERLY TYPED NOW!
// import { STORY_ELEMENTS, AGE_GROUPS, APP_CONFIG } from '@utils/constants';
// import { SUBSCRIPTION_TIERS } from '@config/subscription';
// import type { SampleStory } from '../types/story';
// import type { SubscriptionTierType } from '../types/subscription';

// // Enhanced Metadata for SEO
// export const metadata: Metadata = {
//   title: `${APP_CONFIG.NAME} - Where Children Create Amazing Stories with AI | Safe Writing Platform`,
//   description: `The #1 AI-powered story writing platform for children ages 2-18. Safe, COPPA-compliant collaborative writing that encourages creativity. Join 10,000+ young writers today!`,
//   keywords: [
//     'children story writing app',
//     'AI story helper for kids',
//     'creative writing platform kids',
//     'safe writing app children',
//     'collaborative storytelling',
//     'educational writing tool',
//     'story mentor for kids',
//     'COPPA compliant writing app',
//     'children creativity platform',
//     'AI writing assistant kids',
//   ],
//   authors: [{ name: `${APP_CONFIG.NAME} Team`, url: 'https://mintoons.com' }],
//   creator: APP_CONFIG.NAME,
//   publisher: APP_CONFIG.NAME,
//   formatDetection: {
//     email: false,
//     address: false,
//     telephone: false,
//   },
//   metadataBase: new URL('https://mintoons.com'),
//   openGraph: {
//     title: `${APP_CONFIG.NAME} - Where Children Create Amazing Stories with AI`,
//     description:
//       'Join 10,000+ young writers on the safest AI-powered story platform. Children write WITH AI guidance, not AI generation. Ages 2-18.',
//     url: 'https://mintoons.com',
//     siteName: APP_CONFIG.NAME,
//     images: [
//       {
//         url: '/images/og/homepage-hero.jpg',
//         width: 1200,
//         height: 630,
//         alt: 'Children writing creative stories with AI guidance on MINTOONS platform',
//         type: 'image/jpeg',
//       },
//       {
//         url: '/images/og/homepage-mobile.jpg',
//         width: 600,
//         height: 315,
//         alt: 'MINTOONS mobile app for children story writing',
//         type: 'image/jpeg',
//       },
//     ],
//     locale: 'en_US',
//     type: 'website',
//     countryName: 'United States',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     site: '@mintoons',
//     creator: '@mintoons',
//     title: `${APP_CONFIG.NAME} - Where Children Create Amazing Stories with AI`,
//     description:
//       'Safe, collaborative story writing platform for 10,000+ young writers. AI guidance, not generation. Ages 2-18.',
//     images: {
//       url: '/images/og/homepage-hero.jpg',
//       alt: 'MINTOONS - AI-powered story writing for children',
//     },
//   },
//   robots: {
//     index: true,
//     follow: true,
//     nocache: false,
//     googleBot: {
//       index: true,
//       follow: true,
//       noimageindex: false,
//       'max-video-preview': -1,
//       'max-image-preview': 'large',
//       'max-snippet': -1,
//     },
//   },
//   verification: {
//     google: 'mintoons-google-verification-code',
//     yandex: 'mintoons-yandex-verification',
//     other: {
//       'facebook-domain-verification': 'mintoons-facebook-domain-verification',
//     },
//   },
//   alternates: {
//     canonical: 'https://mintoons.com',
//     languages: {
//       'en-US': 'https://mintoons.com',
//       'es-ES': 'https://mintoons.com/es',
//       'fr-FR': 'https://mintoons.com/fr',
//     },
//   },
//   category: 'Education',
//   classification: 'Children Educational Platform',
//   referrer: 'origin-when-cross-origin',
// };

// // Enhanced sample stories using PROPER SampleStory interface
// const sampleStories: SampleStory[] = [
//   {
//     id: 'sample-1',
//     title: 'The Magic Rainbow Bridge',
//     content:
//       'Luna discovered a shimmering bridge made of rainbow light that connected her backyard to a world where animals could talk and flowers sang melodies. As she stepped onto the first rainbow stripe, her feet tingled with magic, and she heard a gentle voice calling her name from the other side...',
//     description:
//       'A magical adventure about friendship and discovery in an enchanted world where nature comes alive.',
//     authorName: 'Emma, age 8',
//     authorAge: 8,
//     readingTime: 4,
//     minAge: 6,
//     maxAge: 10,
//     difficulty: 'Beginner',
//     genre:
//       STORY_ELEMENTS.GENRES.find(g => g.id === 'fantasy')?.name || 'Fantasy',
//     rating: 4.8,
//     learningGoals: [
//       'Creative imagination',
//       'Descriptive writing',
//       'Character development',
//     ],
//     elements: {
//       genre: 'fantasy',
//       setting: 'forest',
//       character: 'ordinary',
//       mood: 'magical',
//       conflict: 'mystery',
//       theme: 'friendship',
//     },
//   },
//   {
//     id: 'sample-2',
//     title: 'Mission: Save the Space Station',
//     content:
//       'Commander Jake detected mysterious signals coming from the abandoned space station orbiting Mars. With his robot companion ZETA, he must solve the puzzle before the station crashes into the planet. Time was running out, and the strange beeping sounds were getting louder...',
//     description:
//       'A thrilling space adventure combining technology, problem-solving, and teamwork.',
//     authorName: 'Alex, age 12',
//     authorAge: 12,
//     readingTime: 7,
//     minAge: 10,
//     maxAge: 15,
//     difficulty: 'Intermediate',
//     genre:
//       STORY_ELEMENTS.GENRES.find(g => g.id === 'space')?.name ||
//       'Space Adventure',
//     rating: 4.9,
//     learningGoals: [
//       'Science concepts',
//       'Problem solving',
//       'Technical vocabulary',
//     ],
//     elements: {
//       genre: 'space',
//       setting: 'space',
//       character: 'robot',
//       mood: 'exciting',
//       conflict: 'rescue',
//       theme: 'teamwork',
//     },
//   },
//   {
//     id: 'sample-3',
//     title: 'Whiskers the Brave Cat',
//     content:
//       'When all the neighborhood pets started disappearing, Whiskers knew she had to be brave and find them. Her adventure led her through secret tunnels under the city, where she discovered the kindest surprise - a lonely old man who just wanted some furry friends to keep him company...',
//     description:
//       'A heartwarming tale about courage, kindness, and understanding others.',
//     authorName: 'Lily, age 6',
//     authorAge: 6,
//     readingTime: 3,
//     minAge: 4,
//     maxAge: 8,
//     difficulty: 'Beginner',
//     genre:
//       STORY_ELEMENTS.GENRES.find(g => g.id === 'animal')?.name ||
//       'Animal Tales',
//     rating: 4.7,
//     learningGoals: ['Empathy', 'Basic story structure', 'Simple vocabulary'],
//     elements: {
//       genre: 'animal',
//       setting: 'village',
//       character: 'animal',
//       mood: 'brave',
//       conflict: 'rescue',
//       theme: 'kindness',
//     },
//   },
// ];

// // Modern features with enhanced descriptions
// const features = [
//   {
//     icon: Sparkles,
//     title: 'AI Writing Companion',
//     description:
//       'Smart prompts and suggestions that inspire creativity while children write their own unique stories',
//     color: 'from-purple-500 to-pink-500',
//     bgColor: 'bg-purple-50 dark:bg-purple-900/20',
//   },
//   {
//     icon: Shield,
//     title: 'Ultra-Safe Environment',
//     description:
//       'COPPA-compliant platform with advanced content filtering and parental controls for peace of mind',
//     color: 'from-green-500 to-emerald-500',
//     bgColor: 'bg-green-50 dark:bg-green-900/20',
//   },
//   {
//     icon: Users,
//     title: 'Expert Story Mentors',
//     description:
//       'Professional educators provide personalized feedback and encouragement for every young writer',
//     color: 'from-blue-500 to-cyan-500',
//     bgColor: 'bg-blue-50 dark:bg-blue-900/20',
//   },
//   {
//     icon: Award,
//     title: 'Gamified Learning',
//     description:
//       'Earn badges, build streaks, and unlock achievements that make writing fun and rewarding',
//     color: 'from-orange-500 to-red-500',
//     bgColor: 'bg-orange-50 dark:bg-orange-900/20',
//   },
//   {
//     icon: BookOpen,
//     title: 'Smart Story Assessment',
//     description:
//       'AI analyzes grammar, creativity, and structure, providing constructive feedback for improvement',
//     color: 'from-pink-500 to-rose-500',
//     bgColor: 'bg-pink-50 dark:bg-pink-900/20',
//   },
//   {
//     icon: Heart,
//     title: 'Creativity-First Approach',
//     description:
//       'Focus on original thinking and imagination rather than AI-generated content',
//     color: 'from-red-500 to-pink-500',
//     bgColor: 'bg-red-50 dark:bg-red-900/20',
//   },
// ];

// // Impressive stats
// const stats = [
//   { value: '50,000+', label: 'Stories Created', icon: BookOpen },
//   { value: '12,000+', label: 'Young Writers', icon: Users },
//   { value: '98.5%', label: 'Parent Satisfaction', icon: Heart },
//   { value: '85+', label: 'Countries Worldwide', icon: Globe },
// ];

// // Enhanced testimonials
// const testimonials = [
//   {
//     content:
//       "MINTOONS has transformed my daughter's relationship with writing. She went from avoiding homework to eagerly creating stories every day. The AI guidance is perfect - it helps without taking over.",
//     author: 'Sarah Michelle',
//     role: 'Mother of Emma, age 9',
//     avatar: '/images/testimonials/sarah-mother.jpg',
//     rating: 5,
//     location: 'California, USA',
//   },
//   {
//     content:
//       "As an elementary principal, I've seen many educational tools. MINTOONS stands out for its focus on creativity over automation. Our students' writing skills have improved dramatically.",
//     author: 'Dr. James Wilson',
//     role: 'Elementary School Principal',
//     avatar: '/images/testimonials/james-principal.jpg',
//     rating: 5,
//     location: 'New York, USA',
//   },
//   {
//     content:
//       'The safety features give me complete peace of mind. My twins use MINTOONS daily, and I love seeing their confidence grow with each story they create.',
//     author: 'Maria Rodriguez',
//     role: 'Mother of twins, ages 7 & 9',
//     avatar: '/images/testimonials/maria-twins.jpg',
//     rating: 5,
//     location: 'Texas, USA',
//   },
// ];

// // Age group benefits using actual AGE_GROUPS constant
// const ageGroups = [
//   {
//     range: AGE_GROUPS.TODDLER.label,
//     title: 'Early Explorers',
//     description: 'Simple words, picture prompts, and basic story structure',
//     features: [
//       'Voice-to-text support',
//       'Visual story elements',
//       'Basic vocabulary',
//     ],
//     color: 'from-yellow-400 to-orange-400',
//     ageData: AGE_GROUPS.TODDLER,
//   },
//   {
//     range: `${AGE_GROUPS.EARLY_ELEMENTARY.label} & ${AGE_GROUPS.LATE_ELEMENTARY.label}`,
//     title: 'Story Builders',
//     description:
//       'Character development, plot structure, and creative challenges',
//     features: ['Grammar assistance', 'Plot development', 'Character creation'],
//     color: 'from-blue-400 to-purple-400',
//     ageData: AGE_GROUPS.EARLY_ELEMENTARY,
//   },
//   {
//     range: `${AGE_GROUPS.MIDDLE_SCHOOL.label} & ${AGE_GROUPS.HIGH_SCHOOL.label}`,
//     title: 'Advanced Writers',
//     description:
//       'Complex narratives, literary devices, and advanced techniques',
//     features: ['Advanced feedback', 'Genre exploration', 'Publishing tools'],
//     color: 'from-purple-400 to-pink-400',
//     ageData: AGE_GROUPS.MIDDLE_SCHOOL,
//   },
// ];

// export default function LandingPage() {
//   return (
//     <div className="min-h-screen overflow-hidden">
//       {/* Hero Section */}
//       <section className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//         {/* Animated background patterns */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl dark:bg-purple-800" />
//           <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-800" />
//           <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200 opacity-10 blur-3xl dark:bg-pink-800" />
//         </div>

//         <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
//           <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
//             {/* Hero Content */}
//             <div className="flex flex-col justify-center space-y-8">
//               <FadeIn delay={0.1}>
//                 <Badge
//                   variant="info"
//                   className="mb-4 w-fit border-0 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white"
//                 >
//                   <Sparkles className="mr-2 h-4 w-4" />
//                   #1 AI-Powered Story Platform for Kids
//                 </Badge>
//               </FadeIn>

//               <FadeIn delay={0.2}>
//                 <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
//                   Where{' '}
//                   <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
//                     Children Create
//                   </span>{' '}
//                   Amazing Stories
//                 </h1>
//               </FadeIn>

//               <FadeIn delay={0.3}>
//                 <div className="text-xl text-gray-600 dark:text-gray-300 sm:text-2xl">
//                   <TypewriterEffect
//                     text="Join 12,000+ young writers on the safest AI-powered story platform. Children write WITH AI guidance, not AI generation."
//                     speed={30}
//                   />
//                 </div>
//               </FadeIn>

//               <FadeIn delay={0.4}>
//                 <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
//                   <Link href="/register" className="group">
//                     <Button
//                       size="lg"
//                       className="w-full transform bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg text-white transition-all duration-200 hover:scale-105 hover:from-purple-700 hover:to-pink-700 sm:w-auto"
//                     >
//                       Start Writing for Free
//                       <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//                     </Button>
//                   </Link>

//                   <Link href="/demo" className="group">
//                     <Button
//                       variant="outline"
//                       size="lg"
//                       className="w-full border-2 border-purple-300 px-8 py-4 text-lg text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20 sm:w-auto"
//                     >
//                       <Play className="mr-2 h-5 w-5" />
//                       Watch Demo (2 min)
//                     </Button>
//                   </Link>
//                 </div>
//               </FadeIn>

//               <FadeIn delay={0.5}>
//                 <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
//                   <div className="flex items-center gap-2">
//                     <CheckCircle className="h-5 w-5 text-green-500" />
//                     <span className="font-medium">Free Forever Plan</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Shield className="h-5 w-5 text-green-500" />
//                     <span className="font-medium">COPPA Compliant</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Heart className="h-5 w-5 text-green-500" />
//                     <span className="font-medium">Loved by Parents</span>
//                   </div>
//                 </div>
//               </FadeIn>
//             </div>

//             {/* Hero Visual */}
//             <div className="relative">
//               <SlideIn direction="right" delay={0.3}>
//                 <div className="relative">
//                   {/* Main hero image */}
//                   <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-2xl dark:from-purple-900/30 dark:to-pink-900/30">
//                     <Image
//                       src="/images/hero/children-writing-stories.jpg"
//                       alt="Happy children writing creative stories with AI assistance"
//                       width={600}
//                       height={400}
//                       className="rounded-2xl shadow-lg"
//                       priority
//                     />

//                     {/* Floating achievement badge */}
//                     <div className="absolute -right-4 -top-4 animate-bounce">
//                       <div className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 p-3 shadow-lg">
//                         <Award className="h-6 w-6 text-white" />
//                       </div>
//                     </div>

//                     {/* Story count indicator */}
//                     <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
//                       <div className="flex items-center gap-3">
//                         <div className="rounded-full bg-gradient-to-r from-green-400 to-blue-400 p-2">
//                           <BookOpen className="h-5 w-5 text-white" />
//                         </div>
//                         <div>
//                           <div className="text-sm font-bold text-gray-900 dark:text-white">
//                             50,000+
//                           </div>
//                           <div className="text-xs text-gray-500 dark:text-gray-400">
//                             Stories Created
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </SlideIn>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="border-t border-gray-200 bg-white py-16 dark:border-gray-700 dark:bg-gray-900">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
//             {stats.map((stat, index) => (
//               <FadeIn key={stat.label} delay={0.1 * index}>
//                 <div className="text-center">
//                   <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
//                     <stat.icon className="h-8 w-8 text-white" />
//                   </div>
//                   <div className="text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
//                     {stat.value}
//                   </div>
//                   <div className="text-sm text-gray-600 dark:text-gray-400 lg:text-base">
//                     {stat.label}
//                   </div>
//                 </div>
//               </FadeIn>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="bg-gray-50 py-24 dark:bg-gray-800">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <FadeIn>
//               <Badge variant="info" className="mb-4">
//                 ✨ Platform Features
//               </Badge>
//             </FadeIn>
//             <FadeIn delay={0.1}>
//               <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
//                 Everything Your Child Needs to{' '}
//                 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                   Write Amazing Stories
//                 </span>
//               </h2>
//             </FadeIn>
//             <FadeIn delay={0.2}>
//               <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
//                 Designed specifically for young writers with safety, creativity,
//                 and learning at the core
//               </p>
//             </FadeIn>
//           </div>

//           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//             {features.map((feature, index) => (
//               <FadeIn key={feature.title} delay={0.1 * index}>
//                 <Card
//                   className={`group relative overflow-hidden border-0 ${feature.bgColor} p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
//                 >
//                   {/* Gradient background on hover */}
//                   <div
//                     className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
//                   />

//                   <div className="relative">
//                     <div
//                       className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color}`}
//                     >
//                       <feature.icon className="h-7 w-7 text-white" />
//                     </div>

//                     <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
//                       {feature.title}
//                     </h3>

//                     <p className="text-gray-600 dark:text-gray-300">
//                       {feature.description}
//                     </p>

//                     <div className="mt-6 flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700 dark:text-purple-400">
//                       Learn more
//                       <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
//                     </div>
//                   </div>
//                 </Card>
//               </FadeIn>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Story Elements Showcase - Using Actual STORY_ELEMENTS */}
//       <section className="bg-white py-24 dark:bg-gray-900">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <FadeIn>
//               <Badge variant="info" className="mb-4">
//                 🎨 Story Elements
//               </Badge>
//             </FadeIn>
//             <FadeIn delay={0.1}>
//               <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
//                 Choose from{' '}
//                 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   Amazing Elements
//                 </span>
//               </h2>
//             </FadeIn>
//             <FadeIn delay={0.2}>
//               <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
//                 Mix and match genres, characters, settings, and moods to create
//                 unique stories
//               </p>
//             </FadeIn>
//           </div>

//           <div className="grid gap-12 lg:grid-cols-2">
//             {/* Genres */}
//             <FadeIn delay={0.1}>
//               <div>
//                 <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
//                   Exciting Genres
//                 </h3>
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   {STORY_ELEMENTS.GENRES.slice(0, 6).map(genre => (
//                     <div
//                       key={genre.id}
//                       className="flex items-center gap-3 rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20"
//                     >
//                       <span className="text-2xl">{genre.icon}</span>
//                       <div>
//                         <div className="font-semibold text-gray-900 dark:text-white">
//                           {genre.name}
//                         </div>
//                         <div className="text-sm text-gray-600 dark:text-gray-400">
//                           {genre.description}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </FadeIn>

//             {/* Settings */}
//             <FadeIn delay={0.2}>
//               <div>
//                 <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
//                   Magical Settings
//                 </h3>
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   {STORY_ELEMENTS.SETTINGS.map(setting => (
//                     <div
//                       key={setting.id}
//                       className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20"
//                     >
//                       <span className="text-2xl">{setting.icon}</span>
//                       <div>
//                         <div className="font-semibold text-gray-900 dark:text-white">
//                           {setting.name}
//                         </div>
//                         <div className="text-sm text-gray-600 dark:text-gray-400">
//                           {setting.description}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </FadeIn>
//           </div>

//           <div className="mt-12 text-center">
//             <FadeIn delay={0.4}>
//               <Link href="/register">
//                 <Button
//                   size="lg"
//                   className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
//                 >
//                   Start Creating Stories
//                   <ArrowRight className="ml-2 h-5 w-5" />
//                 </Button>
//               </Link>
//             </FadeIn>
//           </div>
//         </div>
//       </section>

//       {/* Age Groups Section - Using actual AGE_GROUPS */}
//       <section className="bg-gray-50 py-24 dark:bg-gray-800">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <FadeIn>
//               <Badge variant="info" className="mb-4">
//                 🎯 Age-Appropriate Learning
//               </Badge>
//             </FadeIn>
//             <FadeIn delay={0.1}>
//               <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
//                 Tailored for Every{' '}
//                 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   Young Writer
//                 </span>
//               </h2>
//             </FadeIn>
//           </div>

//           <div className="grid gap-8 lg:grid-cols-3">
//             {ageGroups.map((group, index) => (
//               <FadeIn key={group.range} delay={0.1 * index}>
//                 <Card className="group relative overflow-hidden border-0 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800">
//                   <div
//                     className={`absolute left-0 top-0 h-2 w-full bg-gradient-to-r ${group.color}`}
//                   />

//                   <div className="mb-4">
//                     <Badge variant="default" className="mb-3">
//                       {group.range}
//                     </Badge>
//                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
//                       {group.title}
//                     </h3>
//                   </div>
//                   <p className="mb-6 text-gray-600 dark:text-gray-300">
//                     {group.description}
//                   </p>

//                   <ul className="space-y-3">
//                     {group.features.map((feature, featureIndex) => (
//                       <li
//                         key={featureIndex}
//                         className="flex items-center gap-3"
//                       >
//                         <CheckCircle className="h-5 w-5 text-green-500" />
//                         <span className="text-gray-700 dark:text-gray-300">
//                           {feature}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 </Card>
//               </FadeIn>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Sample Stories Section */}
//       <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-24 dark:from-gray-800 dark:to-gray-900">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <FadeIn>
//               <Badge variant="info" className="mb-4">
//                 📚 Featured Stories
//               </Badge>
//             </FadeIn>
//             <FadeIn delay={0.1}>
//               <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
//                 Amazing Stories by{' '}
//                 <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//                   Young Writers
//                 </span>
//               </h2>
//             </FadeIn>
//             <FadeIn delay={0.2}>
//               <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
//                 See what incredible stories children are creating with{' '}
//                 {APP_CONFIG.NAME}
//               </p>
//             </FadeIn>
//           </div>

//           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//             {sampleStories.map((story, index) => (
//               <FadeIn key={story.id} delay={0.1 * index}>
//                 <Suspense fallback={<LoadingAnimation />}>
//                   <SampleStoryCard story={story} />
//                 </Suspense>
//               </FadeIn>
//             ))}
//           </div>

//           <div className="mt-12 text-center">
//             <FadeIn delay={0.5}>
//               <Link href="/explore-stories">
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400"
//                 >
//                   Explore All Stories
//                   <ArrowRight className="ml-2 h-5 w-5" />
//                 </Button>
//               </Link>
//             </FadeIn>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="bg-white py-24 dark:bg-gray-900">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <FadeIn>
//               <Badge variant="info" className="mb-4">
//                 💬 Parent & Educator Reviews
//               </Badge>
//             </FadeIn>
//             <FadeIn delay={0.1}>
//               <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
//                 Loved by Families{' '}
//                 <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//                   Worldwide
//                 </span>
//               </h2>
//             </FadeIn>
//           </div>

//           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//             {testimonials.map((testimonial, index) => (
//               <FadeIn key={testimonial.author} delay={0.1 * index}>
//                 <Card className="group relative overflow-hidden border-0 bg-gray-50 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800">
//                   {/* Star rating */}
//                   <div className="mb-4 flex gap-1">
//                     {[...Array(testimonial.rating)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className="h-5 w-5 fill-yellow-400 text-yellow-400"
//                       />
//                     ))}
//                   </div>

//                   <blockquote className="mb-6 text-gray-700 dark:text-gray-300">
//                     "{testimonial.content}"
//                   </blockquote>

//                   <div className="flex items-center gap-4">
//                     <Image
//                       src={testimonial.avatar}
//                       alt={`${testimonial.author} profile`}
//                       width={48}
//                       height={48}
//                       className="rounded-full"
//                     />
//                     <div>
//                       <div className="font-semibold text-gray-900 dark:text-white">
//                         {testimonial.author}
//                       </div>
//                       <div className="text-sm text-gray-600 dark:text-gray-400">
//                         {testimonial.role}
//                       </div>
//                       <div className="text-xs text-gray-500 dark:text-gray-500">
//                         {testimonial.location}
//                       </div>
//                     </div>
//                   </div>
//                 </Card>
//               </FadeIn>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section - FIXED to use proper SubscriptionTierType */}
//       <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-24 dark:from-gray-800 dark:to-gray-900">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <FadeIn>
//               <Badge variant="info" className="mb-4">
//                 💎 Simple, Transparent Pricing
//               </Badge>
//             </FadeIn>
//             <FadeIn delay={0.1}>
//               <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
//                 Choose Your{' '}
//                 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   Writing Adventure
//                 </span>
//               </h2>
//             </FadeIn>
//             <FadeIn delay={0.2}>
//               <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
//                 Start free, upgrade anytime. Every plan includes our core safety
//                 features.
//               </p>
//             </FadeIn>
//           </div>

//           <div className="grid gap-8 lg:grid-cols-4">
//             {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTierType[]).map(
//               (tierKey, index) => (
//                 <FadeIn key={tierKey} delay={0.1 * index}>
//                   <Suspense fallback={<LoadingAnimation />}>
//                     <PricingCard
//                       tier={tierKey} // Now properly typed as SubscriptionTierType
//                       isPopular={tierKey === 'PREMIUM'}
//                       className="h-full"
//                     />
//                   </Suspense>
//                 </FadeIn>
//               )
//             )}
//           </div>

//           <div className="mt-12 text-center">
//             <FadeIn delay={0.5}>
//               <p className="text-gray-600 dark:text-gray-400">
//                 All plans include: ✨ AI Writing Assistant • 🛡️ Safety Features
//                 • 📚 Story Library • 🎯 Age-Appropriate Content
//               </p>
//             </FadeIn>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-24">
//         <div className="absolute inset-0 bg-black/20" />
//         <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
//           <FadeIn>
//             <h2 className="text-4xl font-bold text-white sm:text-5xl">
//               Ready to Start Your Child's
//               <br />
//               <span className="text-yellow-300">Writing Journey?</span>
//             </h2>
//           </FadeIn>

//           <FadeIn delay={0.2}>
//             <p className="mt-6 text-xl text-purple-100">
//               Join thousands of families who trust {APP_CONFIG.NAME} for safe,
//               creative story writing
//             </p>
//           </FadeIn>

//           <FadeIn delay={0.3}>
//             <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
//               <Link href="/register" className="group">
//                 <Button
//                   size="lg"
//                   className="w-full transform bg-white px-8 py-4 text-lg font-semibold text-purple-600 transition-all duration-200 hover:scale-105 hover:bg-gray-100 sm:w-auto"
//                 >
//                   Get Started Free Today
//                   <Sparkles className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
//                 </Button>
//               </Link>

//               <Link href="/contact" className="group">
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="w-full border-2 border-white px-8 py-4 text-lg text-white hover:bg-white hover:text-purple-600 sm:w-auto"
//                 >
//                   Questions? Contact Us
//                   <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//                 </Button>
//               </Link>
//             </div>
//           </FadeIn>

//           <FadeIn delay={0.4}>
//             <div className="mt-8 flex justify-center space-x-6 text-sm text-purple-200">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="h-4 w-4" />
//                 <span>No setup fees</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="h-4 w-4" />
//                 <span>Cancel anytime</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="h-4 w-4" />
//                 <span>30-day guarantee</span>
//               </div>
//             </div>
//           </FadeIn>
//         </div>
//       </section>

//       {/* Footer CTA */}
//       <section className="bg-gray-900 py-16">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="grid gap-8 md:grid-cols-3">
//             <FadeIn>
//               <div className="text-center">
//                 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-400">
//                   <Shield className="h-6 w-6 text-white" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-white">100% Safe</h3>
//                 <p className="text-gray-400">
//                   COPPA compliant with advanced safety features
//                 </p>
//               </div>
//             </FadeIn>

//             <FadeIn delay={0.1}>
//               <div className="text-center">
//                 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-pink-400">
//                   <Zap className="h-6 w-6 text-white" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-white">
//                   Instant Setup
//                 </h3>
//                 <p className="text-gray-400">
//                   Start writing stories in under 2 minutes
//                 </p>
//               </div>
//             </FadeIn>

//             <FadeIn delay={0.2}>
//               <div className="text-center">
//                 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-400">
//                   <Award className="h-6 w-6 text-white" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-white">
//                   Award Winning
//                 </h3>
//                 <p className="text-gray-400">
//                   Recognized by educators worldwide
//                 </p>
//               </div>
//             </FadeIn>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// app/page.tsx - Enhanced Landing Page with GSAP Animations
// Start of Selection

'use client';

import React, { useEffect, useRef } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Play,
  Shield,
  Zap,
  Heart,
  Award,
  ChevronRight,
  CheckCircle,
  Globe,
  TrendingUp,
  Palette,
  Brain,
  Target,
  Gift,
  Rocket,
  Crown,
  Camera,
  Music,
  PenTool,
  Rainbow,
  Sun,
  Moon,
  CloudRain,
  TreePine,
} from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Sample kid images (using the available kid1.jpg to kid23.jpg)
const kidImages = Array.from({ length: 23 }, (_, i) => ({
  src: `/images/kid${i + 1}.jpg`,
  alt: `Happy child writing stories ${i + 1}`,
}));

// Enhanced sample stories with more kid-friendly design
const sampleStories = [
  {
    id: 'sample-1',
    title: 'The Magic Rainbow Bridge',
    content:
      'Luna discovered a shimmering bridge made of rainbow light that connected her backyard to a world where animals could talk and flowers sang melodies...',
    description:
      'A magical adventure about friendship and discovery in an enchanted world where nature comes alive.',
    authorName: 'Emma, age 8',
    authorAge: 8,
    readingTime: 4,
    rating: 4.8,
    genre: 'Fantasy',
    color: 'from-pink-400 via-purple-400 to-indigo-400',
    emoji: '🌈',
    kidImage: kidImages[0],
  },
  {
    id: 'sample-2',
    title: 'Mission: Save the Space Station',
    content:
      'Commander Jake detected mysterious signals coming from the abandoned space station orbiting Mars. With his robot companion ZETA, he must solve the puzzle...',
    description:
      'A thrilling space adventure combining technology, problem-solving, and teamwork.',
    authorName: 'Alex, age 12',
    authorAge: 12,
    readingTime: 7,
    rating: 4.9,
    genre: 'Space Adventure',
    color: 'from-blue-400 via-indigo-400 to-purple-400',
    emoji: '🚀',
    kidImage: kidImages[1],
  },
  {
    id: 'sample-3',
    title: 'Whiskers the Brave Cat',
    content:
      'When all the neighborhood pets started disappearing, Whiskers knew she had to be brave and find them. Her adventure led her through secret tunnels...',
    description:
      'A heartwarming tale about courage, kindness, and understanding others.',
    authorName: 'Lily, age 6',
    authorAge: 6,
    readingTime: 3,
    rating: 4.7,
    genre: 'Animal Tales',
    color: 'from-orange-400 via-red-400 to-pink-400',
    emoji: '🐱',
    kidImage: kidImages[2],
  },
];

// Enhanced features with more visual appeal
const features = [
  {
    icon: Sparkles,
    title: 'AI Writing Companion',
    description:
      'Smart prompts and suggestions that inspire creativity while children write their own unique stories',
    color: 'from-purple-500 via-pink-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    emoji: '✨',
    floatingIcon: Crown,
  },
  {
    icon: Shield,
    title: 'Ultra-Safe Environment',
    description:
      'COPPA-compliant platform with advanced content filtering and parental controls for peace of mind',
    color: 'from-green-500 via-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    emoji: '🛡️',
    floatingIcon: Heart,
  },
  {
    icon: Users,
    title: 'Expert Story Mentors',
    description:
      'Professional educators provide personalized feedback and encouragement for every young writer',
    color: 'from-blue-500 via-cyan-500 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    emoji: '👨‍🏫',
    floatingIcon: Target,
  },
  {
    icon: Award,
    title: 'Gamified Learning',
    description:
      'Earn badges, build streaks, and unlock achievements that make writing fun and rewarding',
    color: 'from-orange-500 via-yellow-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-yellow-50',
    emoji: '🏆',
    floatingIcon: Gift,
  },
  {
    icon: BookOpen,
    title: 'Smart Story Assessment',
    description:
      'AI analyzes grammar, creativity, and structure, providing constructive feedback for improvement',
    color: 'from-pink-500 via-rose-500 to-purple-500',
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
    emoji: '📚',
    floatingIcon: Brain,
  },
  {
    icon: Palette,
    title: 'Creativity-First Approach',
    description:
      'Focus on original thinking and imagination rather than AI-generated content',
    color: 'from-red-500 via-pink-500 to-purple-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
    emoji: '🎨',
    floatingIcon: Rocket,
  },
];

// Enhanced stats with animations
const stats = [
  {
    value: '50,000+',
    label: 'Stories Created',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
  },
  {
    value: '12,000+',
    label: 'Young Writers',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    value: '98.5%',
    label: 'Parent Satisfaction',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
  },
  {
    value: '85+',
    label: 'Countries Worldwide',
    icon: Globe,
    color: 'from-green-500 to-blue-500',
  },
];

// Enhanced testimonials with kid images
const testimonials = [
  {
    content:
      "MINTOONS has transformed my daughter's relationship with writing. She went from avoiding homework to eagerly creating stories every day!",
    author: 'Sarah Michelle',
    role: 'Mother of Emma, age 9',
    kidImage: kidImages[5],
    rating: 5,
    location: 'California, USA',
    color: 'from-pink-400 to-purple-400',
  },
  {
    content:
      "Our students' writing skills have improved dramatically. MINTOONS stands out for its focus on creativity over automation.",
    author: 'Dr. James Wilson',
    role: 'Elementary School Principal',
    kidImage: kidImages[8],
    rating: 5,
    location: 'New York, USA',
    color: 'from-blue-400 to-indigo-400',
  },
  {
    content:
      'The safety features give me complete peace of mind. My twins use MINTOONS daily, and I love seeing their confidence grow!',
    author: 'Maria Rodriguez',
    role: 'Mother of twins, ages 7 & 9',
    kidImage: kidImages[12],
    rating: 5,
    location: 'Texas, USA',
    color: 'from-green-400 to-teal-400',
  },
];

// Floating animation elements
const FloatingElement: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      gsap.set(element, { y: 0 });
      gsap.to(element, {
        y: -20,
        duration: 3,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
        delay: delay,
      });
    }
  }, [delay]);

  return (
    <div ref={elementRef} className="absolute">
      {children}
    </div>
  );
};

// Story Elements with beautiful icons
const storyElements = {
  genres: [
    { name: 'Fantasy', icon: '🦄', color: 'from-purple-400 to-pink-400' },
    { name: 'Adventure', icon: '🗺️', color: 'from-blue-400 to-green-400' },
    { name: 'Space', icon: '🚀', color: 'from-indigo-400 to-purple-400' },
    { name: 'Animals', icon: '🐾', color: 'from-orange-400 to-red-400' },
    { name: 'Mystery', icon: '🔍', color: 'from-gray-400 to-blue-400' },
    { name: 'Friendship', icon: '👫', color: 'from-pink-400 to-yellow-400' },
  ],
  settings: [
    {
      name: 'Enchanted Forest',
      icon: '🌲',
      color: 'from-green-400 to-teal-400',
    },
    {
      name: 'Magical Castle',
      icon: '🏰',
      color: 'from-purple-400 to-blue-400',
    },
    { name: 'Space Station', icon: '🛸', color: 'from-blue-400 to-indigo-400' },
    { name: 'Underwater City', icon: '🐠', color: 'from-cyan-400 to-blue-400' },
    { name: 'Sky Kingdom', icon: '☁️', color: 'from-sky-400 to-purple-400' },
    { name: 'Time Portal', icon: '⏰', color: 'from-yellow-400 to-orange-400' },
  ],
};

export default function EnhancedLandingPage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const storiesRef = useRef(null);

  useEffect(() => {
    // Hero animations
    const heroTimeline = gsap.timeline();

    heroTimeline
      .from('.hero-badge', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'back.out(1.7)',
      })
      .from(
        '.hero-title',
        { opacity: 0, y: 50, duration: 1, ease: 'power3.out' },
        '-=0.4'
      )
      .from(
        '.hero-subtitle',
        { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
      )
      .from(
        '.hero-buttons',
        { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      )
      .from(
        '.hero-features',
        { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' },
        '-=0.2'
      )
      .from(
        '.hero-image',
        { opacity: 0, scale: 0.8, duration: 1, ease: 'back.out(1.3)' },
        '-=0.8'
      );

    // Stats counter animation
    ScrollTrigger.create({
      trigger: '.stats-section',
      start: 'top 80%',
      onEnter: () => {
        document.querySelectorAll('.stat-number').forEach((stat, index) => {
          const finalValue = stat.getAttribute('data-value');
          gsap.from(stat, {
            textContent: 0,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            delay: index * 0.1,
            onUpdate: function () {
              const value = Math.round(this.targets()[0].textContent);
              if (finalValue && finalValue.includes('+')) {
                stat.textContent = value.toLocaleString() + '+';
              } else if (finalValue && finalValue.includes('%')) {
                stat.textContent = value + '%';
              } else {
                stat.textContent = value.toLocaleString() + '+';
              }
            },
          });
        });
      },
    });

    // Feature cards animation
    gsap.fromTo(
      '.feature-card',
      { opacity: 0, y: 60, rotateX: 45 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
        },
      }
    );

    // Story cards animation
    gsap.fromTo(
      '.story-card',
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.3)',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.stories-grid',
          start: 'top 80%',
        },
      }
    );

    // Testimonial cards animation
    gsap.fromTo(
      '.testimonial-card',
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.testimonials-grid',
          start: 'top 80%',
        },
      }
    );

    // Continuous floating animations for decorative elements
    gsap.to('.floating-decoration', {
      y: -15,
      duration: 2,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
      stagger: 0.3,
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
            {/* Hero Content */}
            <div className="space-y-8 text-center lg:space-y-10 lg:text-left">
              {/* Badge */}
              <div className="hero-badge inline-flex cursor-pointer items-center rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <Sparkles
                  className="mr-2 h-5 w-5 animate-spin"
                  style={{ animationDuration: '3s' }}
                />
                <span className="text-sm font-semibold sm:text-base">
                  #1 AI-Powered Story Platform for Kids
                </span>
              </div>

              {/* Main Title */}
              <h1 className="hero-title text-xl font-black leading-tight sm:text-3xl lg:text-5xl ">
                Where{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Children Create
                </span>{' '}
                <span className="relative">
                  Amazing Stories
                  <div
                    className="absolute -right-8 -top-4 animate-bounce text-3xl sm:text-4xl"
                    style={{ animationDelay: '0.5s' }}
                  >
                    ✨
                  </div>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle max-w-2xl text-xl leading-relaxed text-gray-600 sm:text-2xl lg:text-3xl">
                Join <span className="font-bold text-purple-600">12,000+</span>{' '}
                young writers on the safest AI-powered story platform. Children
                write <span className="font-bold text-pink-600">WITH</span> AI
                guidance, not AI generation.
              </p>

              {/* CTA Buttons */}
              <div className="hero-buttons flex flex-col justify-center gap-6 sm:flex-row lg:justify-start">
                <button className="group relative transform rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <span className="relative z-10 flex items-center justify-center">
                    Start Writing for Free
                    <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-700 via-pink-700 to-indigo-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>

                <button className="border-3 group transform rounded-2xl border-purple-300 bg-white px-8 py-4 text-lg font-bold text-purple-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-50 hover:shadow-xl">
                  <span className="flex items-center justify-center">
                    <Play className="mr-2 h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    Watch Demo (2 min)
                  </span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="hero-features flex flex-wrap items-center justify-center gap-6 text-sm sm:text-base lg:justify-start">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Free Forever Plan</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-medium">COPPA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Loved by Parents</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all duration-500">
              <Image
                src="/images/kid1.jpg"
                alt="Happy children writing creative stories with AI assistance"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl transition-transform duration-500 hover:scale-105"
                priority
              />

              {/* Floating badge */}
              <div
                className="absolute left-4 top-4 z-30"
                style={{ animationDelay: '2s' }}
              >
                <div className="rounded-full bg-gradient-to-r from-pink-400 to-purple-400 px-4 py-2 shadow-lg">
                  <span className="text-sm font-bold text-white">
                    ✨ AI Powered
                  </span>
                </div>
              </div>

              {/* Floating achievement badge */}
              <div className="absolute right-4 top-16 z-30">
                <div className="animate-bounce rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 p-4 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Floating card */}
              <div
                className="absolute bottom-4 left-4 z-30"
                style={{ animationDelay: '1s' }}
              >
                <div className="rounded-2xl bg-white p-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-gradient-to-r from-green-400 to-blue-400 p-3">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        50K+
                      </div>
                      <div className="text-sm text-gray-500">
                        Stories Created
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section border-y border-purple-100 bg-white/90 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {stats.map(stat => (
              <div key={stat.label} className="group text-center">
                <div
                  className={`mx-auto mb-6 h-20 w-20 rounded-3xl bg-gradient-to-br ${stat.color} p-1 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-3xl bg-white">
                    {React.createElement(stat.icon, {
                      className:
                        'h-8 w-8 text-gray-700 group-hover:text-purple-500 transition-colors duration-300',
                    })}
                  </div>
                </div>
                <div
                  className="stat-number bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-black text-transparent lg:text-5xl"
                  data-value={stat.value}
                >
                  {stat.value}
                </div>
                <div className="mt-2 font-medium text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="bg-gradient-to-br from-gray-50 to-purple-50 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3">
              <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-700">
                Platform Features
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl">
              Everything Your Child Needs to{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Write Amazing Stories
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 lg:text-2xl">
              Designed specifically for young writers with safety, creativity,
              and learning at the core
            </p>
          </div>

          {/* Features Grid */}
          <div className="features-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`feature-card group relative overflow-hidden rounded-3xl ${feature.bgColor} cursor-pointer p-8 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
                />

                {/* Floating icon */}
                <div className="floating-decoration absolute -right-2 -top-2 opacity-20">
                  <feature.floatingIcon className="h-16 w-16 text-gray-400" />
                </div>

                <div className="relative z-10">
                  {/* Main icon */}
                  <div className="mb-6 flex items-center">
                    <div
                      className={`rounded-2xl bg-gradient-to-br p-4 ${feature.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="ml-4 text-3xl">{feature.emoji}</span>
                  </div>

                  <h3 className="mb-4 text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-purple-900">
                    {feature.title}
                  </h3>

                  <p className="mb-6 leading-relaxed text-gray-600">
                    {feature.description}
                  </p>

                  <div className="flex items-center font-semibold text-purple-600 transition-colors duration-300 group-hover:text-purple-700">
                    Learn more
                    <ChevronRight className="ml-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Elements Section */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3">
              <Palette className="mr-2 h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-700">
                Story Elements
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl">
              Choose from{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Amazing Elements
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 lg:text-2xl">
              Mix and match genres, characters, settings, and moods to create
              unique stories
            </p>
          </div>

          <div className="grid gap-16 lg:grid-cols-2">
            {/* Genres */}
            <div>
              <h3 className="mb-8 flex items-center text-3xl font-bold text-gray-900">
                <span className="mr-4 text-4xl">🎭</span>
                Exciting Genres
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {storyElements.genres.map((genre, index) => (
                  <div
                    key={genre.name}
                    className={`group rounded-2xl bg-gradient-to-br p-6 ${genre.color} cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                        {genre.icon}
                      </span>
                      <div>
                        <div className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-yellow-100">
                          {genre.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="mb-8 flex items-center text-3xl font-bold text-gray-900">
                <span className="mr-4 text-4xl">🌍</span>
                Magical Settings
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {storyElements.settings.map((setting, index) => (
                  <div
                    key={setting.name}
                    className={`group rounded-2xl bg-gradient-to-br p-6 ${setting.color} cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                        {setting.icon}
                      </span>
                      <div>
                        <div className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-yellow-100">
                          {setting.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button className="group transform rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-10 py-5 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              Start Creating Stories
              <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Age Groups Section */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-green-200 bg-gradient-to-r from-green-100 to-blue-100 px-6 py-3">
              <Target className="mr-2 h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-700">
                Age-Appropriate Learning
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl">
              Tailored for Every{' '}
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Young Writer
              </span>
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                range: 'Ages 2-5',
                title: 'Early Explorers',
                description:
                  'Simple words, picture prompts, and basic story structure',
                features: [
                  'Voice-to-text support',
                  'Visual story elements',
                  'Basic vocabulary',
                ],
                color: 'from-yellow-400 to-orange-400',
                kidImage: kidImages[3],
                emoji: '🌱',
              },
              {
                range: 'Ages 6-12',
                title: 'Story Builders',
                description:
                  'Character development, plot structure, and creative challenges',
                features: [
                  'Grammar assistance',
                  'Plot development',
                  'Character creation',
                ],
                color: 'from-blue-400 to-purple-400',
                kidImage: kidImages[7],
                emoji: '🏗️',
              },
              {
                range: 'Ages 13-18',
                title: 'Advanced Writers',
                description:
                  'Complex narratives, literary devices, and advanced techniques',
                features: [
                  'Advanced feedback',
                  'Genre exploration',
                  'Publishing tools',
                ],
                color: 'from-purple-400 to-pink-400',
                kidImage: kidImages[15],
                emoji: '🚀',
              },
            ].map((group, index) => (
              <div
                key={group.range}
                className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div
                  className={`absolute left-0 top-0 h-2 w-full bg-gradient-to-r ${group.color}`}
                />

                <div className="mb-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{group.emoji}</span>
                    <div className="rounded-full bg-gray-100 px-4 py-2">
                      <span className="font-bold text-gray-700">
                        {group.range}
                      </span>
                    </div>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">
                    {group.title}
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    {group.description}
                  </p>
                </div>

                <div className="mb-6">
                  <Image
                    src={group.kidImage.src}
                    alt={group.kidImage.alt}
                    width={300}
                    height={200}
                    className="rounded-2xl shadow-md transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <ul className="space-y-3">
                  {group.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Stories Section */}
      <section
        ref={storiesRef}
        className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-pink-200 bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3">
              <BookOpen className="mr-2 h-5 w-5 text-pink-600" />
              <span className="font-semibold text-pink-700">
                Featured Stories
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl">
              Amazing Stories by{' '}
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Young Writers
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 lg:text-2xl">
              See what incredible stories children are creating with MINTOONS
            </p>
          </div>

          {/* Stories Grid */}
          <div className="stories-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sampleStories.map((story, index) => (
              <div
                key={story.id}
                className={`story-card group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
              >
                {/* Header with gradient */}
                <div
                  className={`relative h-48 bg-gradient-to-br ${story.color} flex items-center justify-center p-6`}
                >
                  <span className="text-6xl transition-transform duration-500 group-hover:scale-110">
                    {story.emoji}
                  </span>

                  {/* Genre badge */}
                  <div className="absolute left-4 top-4">
                    <div className="rounded-full border border-white/30 bg-white/20 px-3 py-1 backdrop-blur-sm">
                      <span className="text-sm font-medium text-white">
                        {story.genre}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="absolute right-4 top-4">
                    <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 px-3 py-1 backdrop-blur-sm">
                      <Star className="h-4 w-4 fill-current text-yellow-300" />
                      <span className="text-sm font-medium text-white">
                        {story.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 p-6">
                  <h3 className="text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-purple-600">
                    {story.title}
                  </h3>

                  <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {story.content}
                  </p>

                  {/* Author info with kid image */}
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <Image
                      src={story.kidImage.src}
                      alt={story.kidImage.alt}
                      width={40}
                      height={40}
                      className="rounded-full shadow-sm"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {story.authorName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {story.readingTime} min read
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="border-3 group transform rounded-2xl border-purple-300 bg-white px-10 py-5 text-xl font-bold text-purple-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-50 hover:shadow-xl">
              Explore All Stories
              <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-green-200 bg-gradient-to-r from-green-100 to-blue-100 px-6 py-3">
              <Heart className="mr-2 h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-700">
                Parent & Educator Reviews
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl">
              Loved by Families{' '}
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="testimonials-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.author}
                className="testimonial-card group relative overflow-hidden rounded-3xl bg-gray-50 p-8 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                {/* Gradient accent */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${testimonial.color}`}
                />

                {/* Star rating */}
                <div className="mb-6 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-current text-yellow-400"
                    />
                  ))}
                </div>

                <blockquote className="mb-6 italic leading-relaxed text-gray-700">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.kidImage.src}
                    alt={`${testimonial.author} family`}
                    width={60}
                    height={60}
                    className="rounded-full shadow-md"
                  />
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-24 lg:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute left-10 top-10 h-32 w-32 animate-pulse rounded-full bg-white/10" />
          <div
            className="absolute bottom-20 right-20 h-24 w-24 animate-pulse rounded-full bg-white/10"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute left-1/3 top-1/2 h-16 w-16 animate-pulse rounded-full bg-white/10"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            Ready to Start Your Child's
            <br />
            <span className="text-yellow-300">Writing Journey?</span>
          </h2>

          <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-purple-100 lg:text-2xl">
            Join thousands of families who trust MINTOONS for safe, creative
            story writing
          </p>

          <div className="mb-12 flex flex-col justify-center gap-6 sm:flex-row">
            <button className="group transform rounded-2xl bg-white px-10 py-5 text-xl font-bold text-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <span className="flex items-center justify-center">
                Get Started Free Today
                <Sparkles className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
              </span>
            </button>

            <button className="border-3 group transform rounded-2xl border-white px-10 py-5 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white hover:text-purple-600 hover:shadow-2xl">
              <span className="flex items-center justify-center">
                Questions? Contact Us
                <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-purple-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>30-day guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="group text-center">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-r from-green-400 to-blue-400 p-1 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-900">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">100% Safe</h3>
              <p className="leading-relaxed text-gray-400">
                COPPA compliant with advanced safety features and parental
                controls
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 p-1 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-900">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                Instant Setup
              </h3>
              <p className="leading-relaxed text-gray-400">
                Start writing amazing stories in under 2 minutes with our simple
                onboarding
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-r from-orange-400 to-red-400 p-1 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-900">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                Award Winning
              </h3>
              <p className="leading-relaxed text-gray-400">
                Recognized by educators worldwide for excellence in creative
                education
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
