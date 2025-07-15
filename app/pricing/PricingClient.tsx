'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Check, 
  Star, 
  Crown, 
  Zap, 
  Heart, 
  Shield, 
  Users, 
  BookOpen,
  MessageCircle,
  Award,
  Sparkles,
  ArrowRight,
  Gift,
  TrendingUp
  , Lock, Eye
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Switch } from '@components/ui/switch';
import { PricingCard } from '@components/subscription/PricingCard';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { SubscriptionConfig, SUBSCRIPTION_TIERS } from '@config/subscription';
import { formatPrice } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

export default function PricingClient() {
  const { data: session } = useSession();
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const currentTier = session?.user?.subscriptionTier || 'FREE';
  const allTiers = SubscriptionConfig.getAllTiers();

  // Calculate annual savings (mock calculation - implement when annual plans added)
  const getAnnualPrice = (monthlyPrice: number) => {
    return monthlyPrice * 10; // 2 months free
  };

  const getAnnualSavings = (monthlyPrice: number) => {
    return monthlyPrice * 2; // 2 months savings
  };

  const features = {
    core: [
      { name: 'Story Creation Tools', icon: BookOpen, description: 'Interactive story builder with prompts' },
      { name: 'AI Writing Assistant', icon: Sparkles, description: 'Smart suggestions and grammar help' },
      { name: 'Parent Dashboard', icon: Users, description: 'Track your child\'s progress' },
      { name: 'Safe Environment', icon: Shield, description: 'COPPA-compliant platform' },
    ],
    premium: [
      { name: 'Mentor Feedback', icon: MessageCircle, description: 'Professional writing guidance' },
      { name: 'Advanced Analytics', icon: TrendingUp, description: 'Detailed progress insights' },
      { name: 'Achievement System', icon: Award, description: 'Badges and rewards' },
      { name: 'Story Sharing', icon: Heart, description: 'Share with family and friends' },
    ],
  };

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'Yes! Our Free plan allows unlimited access to basic features with a limit of 50 stories per month. No credit card required.',
    },
    {
      question: 'Can I upgrade or downgrade anytime?',
      answer: 'Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.',
    },
    {
      question: 'Is my child\'s data safe?',
      answer: 'Yes! We\'re COPPA compliant and follow strict privacy guidelines. Your child\'s stories and data are completely secure and private.',
    },
    {
      question: 'What ages is MINTOONS suitable for?',
      answer: 'MINTOONS is designed for children aged 2-18, with age-appropriate features and content moderation for each age group.',
    },
    {
      question: 'Do you offer family discounts?',
      answer: 'Yes! Contact us for family plans if you have multiple children. We offer special pricing for families and educators.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and offer monthly or annual billing options.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Parent of 8-year-old',
      content: 'My daughter has written 15 stories in just 2 months! The mentor feedback really helps her improve.',
      rating: 5,
      tier: 'PREMIUM',
    },
    {
      name: 'Mike T.',
      role: 'Father of twins (age 10)',
      content: 'Worth every penny. Both my kids are excited about writing now, and I love tracking their progress.',
      rating: 5,
      tier: 'PRO',
    },
    {
      name: 'Jennifer L.',
      role: '3rd Grade Teacher',
      content: 'I use MINTOONS with my entire class. The engagement and improvement in writing skills is remarkable.',
      rating: 5,
      tier: 'PRO',
    },
  ];

  const handlePlanSelection = (tier: string) => {
    trackEvent(TRACKING_EVENTS.BUTTON_CLICK, {
      tier,
      currentTier,
      isAnnual,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Crown className="w-4 h-4" />
              Choose Your Plan
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Unlock Your Child's{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Creative Potential
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Start with our free plan and upgrade as your young storyteller grows. 
              Every plan includes safe, age-appropriate tools designed to inspire creativity.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-purple-600"
              />
              <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
              </span>
              {isAnnual && (
               <Badge variant="success" size="sm" className="ml-2">
                 <Gift className="w-3 h-3 mr-1" />
                 2 months free!
               </Badge>
             )}
           </div>
         </div>
       </FadeIn>

       {/* Pricing Cards */}
       <div className="grid lg:grid-cols-4 gap-8 mb-16">
         {allTiers.map((tier, index) => {
           const isPopular = tier.id === 'PREMIUM';
           const isCurrentPlan = tier.id === currentTier;
           const price = isAnnual ? getAnnualPrice(tier.price) : tier.price;
           const savings = isAnnual && tier.price > 0 ? getAnnualSavings(tier.price) : 0;

           return (
             <FadeIn key={tier.id} delay={0.1 * index}>
               <motion.div
                 onHoverStart={() => setHoveredTier(tier.id)}
                 onHoverEnd={() => setHoveredTier(null)}
                 className="h-full"
               >
                 <PricingCard
                   tier={tier.id as any}
                   currentTier={currentTier as any}
                   isPopular={isPopular}
                   isCurrentPlan={isCurrentPlan}
                   onSelect={handlePlanSelection}
                   className={`relative transition-all duration-300 ${
                     hoveredTier === tier.id ? 'scale-105' : ''
                   } ${isPopular ? 'ring-2 ring-purple-500 shadow-2xl' : ''}`}
                 />
                 
                 {/* Annual Savings Badge */}
                 {isAnnual && savings > 0 && (
                   <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                   >
                     <Badge variant="success" className="whitespace-nowrap">
                       Save {formatPrice(savings)}
                     </Badge>
                   </motion.div>
                 )}
               </motion.div>
             </FadeIn>
           );
         })}
       </div>

       {/* Feature Comparison */}
       <SlideIn direction="up" delay={0.4}>
         <Card className="p-8 mb-16">
           <div className="text-center mb-8">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">
               What's Included in Each Plan
             </h2>
             <p className="text-gray-600">
               Compare features across all our plans to find the perfect fit
             </p>
           </div>

           {/* Core Features */}
           <div className="mb-8">
             <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-blue-600" />
               Core Features (All Plans)
             </h3>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {features.core.map((feature, index) => (
                 <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                   <feature.icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                   <div>
                     <h4 className="font-medium text-gray-900">{feature.name}</h4>
                     <p className="text-sm text-gray-600">{feature.description}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Premium Features */}
           <div>
             <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
               <Crown className="w-5 h-5 text-purple-600" />
               Premium Features (Paid Plans)
             </h3>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {features.premium.map((feature, index) => (
                 <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                   <feature.icon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                   <div>
                     <h4 className="font-medium text-gray-900">{feature.name}</h4>
                     <p className="text-sm text-gray-600">{feature.description}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </Card>
       </SlideIn>

       {/* Testimonials */}
       <SlideIn direction="up" delay={0.5}>
         <div className="mb-16">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">
               Loved by Parents and Kids
             </h2>
             <p className="text-gray-600">
               See what families are saying about MINTOONS
             </p>
           </div>

           <div className="grid lg:grid-cols-3 gap-8">
             {testimonials.map((testimonial, index) => (
               <FadeIn key={index} delay={0.1 * index}>
                 <Card className="p-6 h-full">
                   <div className="flex items-center gap-1 mb-4">
                     {Array.from({ length: testimonial.rating }).map((_, i) => (
                       <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                     ))}
                   </div>
                   
                   <p className="text-gray-700 mb-6 leading-relaxed">
                     "{testimonial.content}"
                   </p>
                   
                   <div className="flex items-center justify-between">
                     <div>
                       <div className="font-medium text-gray-900">{testimonial.name}</div>
                       <div className="text-sm text-gray-600">{testimonial.role}</div>
                     </div>
                     <Badge variant="default" size="sm">
                       {SUBSCRIPTION_TIERS[testimonial.tier as keyof typeof SUBSCRIPTION_TIERS]?.name}
                     </Badge>
                   </div>
                 </Card>
               </FadeIn>
             ))}
           </div>
         </div>
       </SlideIn>

       {/* FAQ Section */}
       <SlideIn direction="up" delay={0.6}>
         <div className="mb-16">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">
               Frequently Asked Questions
             </h2>
             <p className="text-gray-600">
               Everything you need to know about our plans and pricing
             </p>
           </div>

           <div className="grid lg:grid-cols-2 gap-8">
             {faqs.map((faq, index) => (
               <FadeIn key={index} delay={0.1 * index}>
                 <Card className="p-6">
                   <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                   <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                 </Card>
               </FadeIn>
             ))}
           </div>
         </div>
       </SlideIn>

       {/* Security & Trust */}
       <SlideIn direction="up" delay={0.7}>
         <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 mb-16">
           <div className="text-center">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Shield className="w-8 h-8 text-green-600" />
             </div>
             
             <h2 className="text-2xl font-bold text-gray-900 mb-4">
               Your Child's Safety is Our Priority
             </h2>
             
             <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
               MINTOONS is fully COPPA compliant with advanced content filtering, 
               parental controls, and secure data protection. Your child can explore 
               creativity in a completely safe environment.
             </p>

             <div className="flex flex-wrap justify-center gap-6">
               <div className="flex items-center gap-2">
                 <Shield className="w-5 h-5 text-green-600" />
                 <span className="text-sm font-medium text-gray-700">COPPA Compliant</span>
               </div>
               <div className="flex items-center gap-2">
                 <Lock className="w-5 h-5 text-green-600" />
                 <span className="text-sm font-medium text-gray-700">256-bit SSL Encryption</span>
               </div>
               <div className="flex items-center gap-2">
                 <Users className="w-5 h-5 text-green-600" />
                 <span className="text-sm font-medium text-gray-700">Parent Dashboard</span>
               </div>
               <div className="flex items-center gap-2">
                 <Eye className="w-5 h-5 text-green-600" />
                 <span className="text-sm font-medium text-gray-700">Content Moderation</span>
               </div>
             </div>
           </div>
         </Card>
       </SlideIn>

       {/* CTA Section */}
       <FadeIn delay={0.8}>
         <div className="text-center">
           <h2 className="text-3xl font-bold text-gray-900 mb-6">
             Ready to Start Your Child's Writing Journey?
           </h2>
           
           <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
             Join thousands of families who are already nurturing their children's creativity with MINTOONS.
           </p>

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/register">
               <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                 <Sparkles className="w-5 h-5 mr-2" />
                 Start Free Today
               </Button>
             </Link>
             
             <Link href="/contact">
               <Button variant="outline" size="lg">
                 <MessageCircle className="w-5 h-5 mr-2" />
                 Talk to Our Team
               </Button>
             </Link>
           </div>

           <p className="text-sm text-gray-500 mt-6">
             No credit card required • 50 free stories • Cancel anytime
           </p>
         </div>
       </FadeIn>
     </div>
   </div>
 );
}