// app/(dashboard)/create-stories/CreateStoriesClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft,
  Crown,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Alert } from '@components/ui/alert';
import { ElementSelector } from '@components/stories/ElementSelector';
import { CollaborativeWriter } from '@components/stories/CollaborativeWriter';
import { StoryProgress } from '@components/stories/StoryProgress';
import { UpgradePrompt } from '@components/subscription/UpgradePrompt';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { STORY_ELEMENTS } from '@utils/constants';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User } from '@/types/user';
import type { StoryElements } from '@/types/story';

interface CreateStoriesProps {
  user: User;
  storyCount: number;
  storyLimit: number;
  canCreateStory: boolean;
  storiesRemaining: number;
}

type CreationStep = 'limit-check' | 'elements' | 'writing' | 'assessment' | 'complete';

export default function CreateStoriesClient({ 
  user, 
  storyCount, 
  storyLimit, 
  canCreateStory,
  storiesRemaining 
}: CreateStoriesProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CreationStep>('limit-check');
  const [selectedElements, setSelectedElements] = useState<Partial<StoryElements>>({});
  const [storyId, setStoryId] = useState<string | null>(null);
  const [isGeneratingOpening, setIsGeneratingOpening] = useState(false);

  useEffect(() => {
    // Track page view
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'create-stories',
      canCreateStory,
      storiesRemaining,
      subscriptionTier: user.subscriptionTier,
    });

    // Check if user can create story
    if (canCreateStory) {
      setCurrentStep('elements');
    } else {
      setCurrentStep('limit-check');
    }
  }, [canCreateStory, storiesRemaining, user.subscriptionTier]);

  const handleElementsSelected = async (elements: StoryElements) => {
    setSelectedElements(elements);
    setIsGeneratingOpening(true);

    try {
      // Track element selection
      trackEvent(TRACKING_EVENTS.STORY_CREATE, {
        userId: user._id,
        elements,
        step: 'elements_selected',
      });

      // Create story with selected elements
      const response = await fetch('/api/stories/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create story');
      }

      const result = await response.json();
      setStoryId(result.storyId);
      setCurrentStep('writing');

      toast.success('Story elements selected! AI is generating your opening...');
    } catch (error) {
      console.error('Story creation error:', error);
      toast.error('Failed to start story. Please try again.');
      
      trackEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
        type: 'story_creation_failed',
        userId: user._id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGeneratingOpening(false);
    }
  };

  const handleStoryComplete = (completedStoryId: string) => {
    setCurrentStep('assessment');
    
    trackEvent(TRACKING_EVENTS.STORY_COMPLETE, {
      userId: user._id,
      storyId: completedStoryId,
      elements: selectedElements,
    });

    // Redirect to story view after assessment
    setTimeout(() => {
      router.push(`/dashboard/story/${completedStoryId}`);
    }, 3000);
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const resetCreation = () => {
    setCurrentStep('elements');
    setSelectedElements({});
    setStoryId(null);
  };

  // Limit reached UI
  if (currentStep === 'limit-check' && !canCreateStory) {
    return (
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Story Limit Reached
            </h1>
            <p className="text-xl text-gray-600">
              You've written {storyCount} out of {storyLimit} stories in your {user.subscriptionTier} plan
            </p>
          </div>

          <UpgradePrompt
            user={user}
            trigger="usage_limit"
            onUpgrade={handleUpgrade}
            className="max-w-2xl mx-auto"
          />
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <FadeIn>
      <div className="mb-8">
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
               <Sparkles className="w-8 h-8 text-purple-600" />
               Create New Story
             </h1>
             <p className="text-xl text-gray-600">
               Choose your story elements and start writing with AI guidance
             </p>
           </div>

           <div className="text-right">
             <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
               <Target className="w-4 h-4" />
               <span>{storiesRemaining} stories remaining</span>
             </div>
             <Badge variant={storiesRemaining > 5 ? 'success' : storiesRemaining > 0 ? 'warning' : 'error'}>
               {user.subscriptionTier} Plan
             </Badge>
           </div>
         </div>

         {/* Progress Indicator */}
         <div className="mt-6">
           <div className="flex items-center justify-center space-x-4">
             {[
               { step: 'elements', label: 'Choose Elements', icon: Target },
               { step: 'writing', label: 'Write Story', icon: BookOpen },
               { step: 'assessment', label: 'Review & Publish', icon: CheckCircle },
             ].map((stepInfo, index) => (
               <div key={stepInfo.step} className="flex items-center">
                 <div
                   className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                     currentStep === stepInfo.step
                       ? 'bg-purple-600 border-purple-600 text-white'
                       : index < ['elements', 'writing', 'assessment'].indexOf(currentStep)
                       ? 'bg-green-500 border-green-500 text-white'
                       : 'bg-gray-200 border-gray-300 text-gray-500'
                   }`}
                 >
                   {index < ['elements', 'writing', 'assessment'].indexOf(currentStep) ? (
                     <CheckCircle className="w-5 h-5" />
                   ) : (
                     <stepInfo.icon className="w-5 h-5" />
                   )}
                 </div>
                 <span
                   className={`ml-2 text-sm font-medium ${
                     currentStep === stepInfo.step
                       ? 'text-purple-600'
                       : index < ['elements', 'writing', 'assessment'].indexOf(currentStep)
                       ? 'text-green-600'
                       : 'text-gray-500'
                   }`}
                 >
                   {stepInfo.label}
                 </span>
                 {index < 2 && (
                   <ArrowRight className="w-4 h-4 mx-3 text-gray-400" />
                 )}
               </div>
             ))}
           </div>
         </div>
       </div>
     </FadeIn>

     {/* Step Content */}
     <AnimatePresence mode="wait">
       {/* Elements Selection Step */}
       {currentStep === 'elements' && (
         <motion.div
           key="elements"
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
         >
           <Card className="p-8">
             <div className="mb-6">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">
                 Choose Your Story Elements
               </h2>
               <p className="text-gray-600">
                 Select 6 elements to create the foundation of your story. The AI will use these to generate your opening and guide you through writing.
               </p>
             </div>

             <ElementSelector
               elements={STORY_ELEMENTS}
               selectedElements={selectedElements}
               onElementsChange={setSelectedElements}
               onComplete={handleElementsSelected}
               userAge={user.age}
             />
           </Card>
         </motion.div>
       )}

       {/* Writing Step */}
       {currentStep === 'writing' && storyId && (
         <motion.div
           key="writing"
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
         >
           <div className="grid lg:grid-cols-4 gap-6">
             {/* Main Writing Area */}
             <div className="lg:col-span-3">
               <Card className="p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-2xl font-bold text-gray-900">
                     Write Your Story
                   </h2>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={resetCreation}
                   >
                     <RefreshCw className="w-4 h-4 mr-2" />
                     Start Over
                   </Button>
                 </div>

                 {isGeneratingOpening ? (
                   <div className="flex items-center justify-center py-12">
                     <div className="text-center">
                       <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                       <h3 className="text-lg font-semibold text-gray-900 mb-2">
                         AI is crafting your story opening...
                       </h3>
                       <p className="text-gray-600">
                         This usually takes 10-15 seconds
                       </p>
                     </div>
                   </div>
                 ) : (
                   <CollaborativeWriter
                     storyId={storyId}
                     userId={user._id}
                     userAge={user.age}
                     selectedElements={selectedElements as StoryElements}
                     onComplete={handleStoryComplete}
                     subscriptionTier={user.subscriptionTier}
                   />
                 )}
               </Card>
             </div>

             {/* Progress Sidebar */}
             <div className="lg:col-span-1">
               <div className="space-y-6">
                 <StoryProgress
                   storyId={storyId}
                   targetWordCount={user.subscriptionTier === 'FREE' ? 600 : 1200}
                 />

                 {/* Selected Elements */}
                 <Card className="p-4">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">
                     Your Story Elements
                   </h3>
                   <div className="space-y-3">
                     {Object.entries(selectedElements).map(([category, value]) => (
                       <div key={category} className="flex justify-between">
                         <span className="text-sm text-gray-600 capitalize">
                           {category}:
                         </span>
                         <Badge variant="outline" size="sm">
                           {value}
                         </Badge>
                       </div>
                     ))}
                   </div>
                 </Card>

                 {/* Writing Tips */}
                 <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                   <h3 className="text-lg font-semibold text-gray-900 mb-3">
                     💡 Writing Tips
                   </h3>
                   <div className="space-y-2 text-sm text-gray-700">
                     <p>• Write 4-5 lines at a time</p>
                     <p>• Use descriptive words</p>
                     <p>• Show emotions and actions</p>
                     <p>• Let the AI guide you</p>
                   </div>
                 </Card>
               </div>
             </div>
           </div>
         </motion.div>
       )}

       {/* Assessment Step */}
       {currentStep === 'assessment' && (
         <motion.div
           key="assessment"
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
         >
           <Card className="p-8 text-center">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle className="w-10 h-10 text-green-600" />
             </div>

             <h2 className="text-3xl font-bold text-gray-900 mb-4">
               Story Complete! 🎉
             </h2>

             <p className="text-xl text-gray-600 mb-6">
               Great job! Your story has been saved and is being assessed by our AI.
             </p>

             <div className="bg-gray-50 rounded-lg p-6 mb-6">
               <div className="flex items-center justify-center mb-4">
                 <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                 <span className="font-medium">Analyzing your story...</span>
               </div>
               <div className="text-sm text-gray-600">
                 AI is evaluating grammar, creativity, and overall quality
               </div>
             </div>

             <div className="space-y-3">
               <p className="text-gray-600">
                 You'll be redirected to view your story and see the assessment results.
               </p>
               <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                 <span>Redirecting in a few seconds...</span>
               </div>
             </div>
           </Card>
         </motion.div>
       )}
     </AnimatePresence>

     {/* Low Stories Warning */}
     {storiesRemaining <= 3 && storiesRemaining > 0 && (
       <FadeIn delay={0.5}>
         <Alert variant="warning" className="mt-8">
           <AlertCircle className="w-4 h-4" />
           <div>
             <div className="font-medium">Running low on stories!</div>
             <div className="text-sm mt-1">
               You have {storiesRemaining} stories remaining in your {user.subscriptionTier} plan.{' '}
               <button
                 onClick={handleUpgrade}
                 className="underline hover:no-underline font-medium"
               >
                 Upgrade now
               </button>{' '}
               to get more stories.
             </div>
           </div>
         </Alert>
       </FadeIn>
     )}
   </div>
 );
}