// app/components/stories/CollaborativeWriter.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  RotateCcw,
  Save,
  Eye,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { TypewriterEffect } from '@components/animations/TypewriterEffect';
import { StoryProgress } from './StoryProgress';
import { AIAssistant } from './AIAssistant';
import { AssessmentModal } from './AssessmentModal';
import { CommentSystem } from './CommentSystem';
import { aiProviderManager } from '@lib/ai/providers';
import { countWords } from '@utils/helpers';
import { formatNumber } from '@utils/formatters';
import type { Story, StoryElements } from '../../../types/story';

interface CollaborativeWriterProps {
  storyId: string;
  userId: string;
  userAge: number;
  selectedElements: StoryElements;
  onComplete: (storyId: string) => void; // Fixed: expecting storyId parameter
  subscriptionTier: string;
  story?: Story;
  onStoryUpdate?: (content: string) => void;
  onSave?: () => void;
  isReadOnly?: boolean;
}

export const CollaborativeWriter: React.FC<CollaborativeWriterProps> = ({
  storyId,
  userId,
  userAge,
  selectedElements,
  onComplete,
  subscriptionTier,
  story,
  onStoryUpdate,
  onSave,
  isReadOnly = false,
}) => {
  const { data: session } = useSession();
  const [currentStory, setCurrentStory] = useState<Story | null>(story || null);
  const [userInput, setUserInput] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const storyContentRef = useRef<HTMLDivElement>(null);

  // Load story if not provided
  useEffect(() => {
    if (!story && storyId) {
      fetchStory();
    }
  }, [storyId, story]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      if (response.ok) {
        const storyData = await response.json();
        setCurrentStory(storyData);
      }
    } catch (error) {
      console.error('Failed to fetch story:', error);
    }
  };

  const wordCount = countWords(currentStory?.content || '');
  const userInputWordCount = countWords(userInput);
  const minWordsPerTurn = Math.max(20, Math.floor(50 - userAge * 2));
  const targetWords = subscriptionTier === 'FREE' ? 600 : 1200;

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [userInput]);

  const handleStoryUpdate = (content: string) => {
    if (currentStory) {
      setCurrentStory({ ...currentStory, content });
    }
    onStoryUpdate?.(content);
  };

  const handleUserSubmit = async () => {
    if (
      !userInput.trim() ||
      userInputWordCount < minWordsPerTurn ||
      isAIGenerating ||
      !currentStory
    )
      return;

    const newContent = currentStory.content + '\n\n' + userInput.trim();
    handleStoryUpdate(newContent);

    // Generate AI response
    setIsAIGenerating(true);
    setShowAIResponse(false);

    try {
      const aiResponse = await aiProviderManager.generateStoryResponse({
        prompt: userInput,
        context: currentStory.content,
        userAge: userAge,
        storyElements: selectedElements,
        maxTokens: 100 + userAge * 5,
        temperature: 0.8,
      });

      setAiResponse(aiResponse.content);
      setShowAIResponse(true);
      setTurnNumber(prev => prev + 1);
    } catch (error) {
      console.error('AI generation failed:', error);
      setAiResponse("That's interesting! What happens next in your story?");
      setShowAIResponse(true);
    } finally {
      setIsAIGenerating(false);
    }

    setUserInput('');
  };

  const handleAcceptAI = () => {
    if (!currentStory) return;
    const newContent = currentStory.content + '\n\n' + aiResponse;
    handleStoryUpdate(newContent);
    setShowAIResponse(false);
    setAiResponse('');

    // Check if story is complete
    if (countWords(newContent) >= targetWords) {
      handleStoryComplete();
    }
  };

  const handleRejectAI = () => {
    setShowAIResponse(false);
    setAiResponse('');
  };

  const handleStoryComplete = () => {
    onComplete(storyId);
  };

  const handleGetAssessment = async () => {
    if (!currentStory?.content.trim()) return;

    try {
      const assessment = await aiProviderManager.assessStory(
        currentStory.content,
        userAge
      );

      setCurrentAssessment(assessment);
      setShowAssessment(true);
    } catch (error) {
      console.error('Assessment failed:', error);
    }
  };

  const handleSave = async () => {
    if (!currentStory) return;

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentStory.content,
        }),
      });

      if (response.ok) {
        onSave?.();
      }
    } catch (error) {
      console.error('Failed to save story:', error);
    }
  };

  const canSubmit =
    userInput.trim() &&
    userInputWordCount >= minWordsPerTurn &&
    !isAIGenerating;

  if (!currentStory) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentStory.title}
          </h1>
          <div className="mt-2 flex items-center space-x-4">
            <Badge variant="purple" size="sm">
              Turn {turnNumber}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatNumber(wordCount)} words
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare size={16} className="mr-2" />
            Comments
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGetAssessment}
            disabled={!currentStory.content.trim()}
          >
            <Zap size={16} className="mr-2" />
            Get AI Assessment
          </Button>

          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Progress */}
      <StoryProgress
        storyId={storyId}
        targetWordCount={targetWords}
        currentWords={wordCount}
        userAge={userAge}
      />

      {/* Story Content */}
      <Card className="p-6">
        <div
          ref={storyContentRef}
          className="prose prose-lg max-w-none dark:prose-invert"
        >
          {currentStory.content ? (
            <div className="whitespace-pre-wrap leading-relaxed">
              {currentStory.content}
            </div>
          ) : (
            <div className="py-8 text-center italic text-gray-400">
              Your story will appear here as you write...
            </div>
          )}
        </div>

        {/* AI Response Display */}
        <AnimatePresence>
          {showAIResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700"
            >
              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                <div className="mb-3 flex items-center space-x-2">
                  <Sparkles className="text-purple-600" size={16} />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    AI Suggestion
                  </span>
                </div>

                <TypewriterEffect
                  text={aiResponse}
                  speed={50}
                  className="leading-relaxed text-gray-700 dark:text-gray-300"
                />

                <div className="mt-4 flex items-center space-x-2">
                  <Button variant="primary" size="sm" onClick={handleAcceptAI}>
                    Add to Story
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRejectAI}>
                    <RotateCcw size={16} className="mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Writing Input */}
      {!isReadOnly && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Continue Your Story
              </h3>
              <span
                className={`text-sm ${
                  userInputWordCount >= minWordsPerTurn
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {userInputWordCount}/{minWordsPerTurn} words minimum
              </span>
            </div>

            <Textarea
              ref={textareaRef}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="What happens next in your story? Write at least 20 words..."
              className="min-h-[120px] resize-none"
              disabled={isAIGenerating}
            />

            <div className="flex items-center justify-between">
              <AIAssistant
                storyElements={selectedElements}
                currentContent={currentStory.content}
                userAge={userAge}
                onSuggestion={suggestion =>
                  setUserInput(prev => prev + ' ' + suggestion)
                }
              />

              <Button
                variant="primary"
                onClick={handleUserSubmit}
                disabled={!canSubmit}
                isLoading={isAIGenerating}
                className="min-w-[120px]"
              >
                {isAIGenerating ? (
                  <LoadingAnimation variant="write" size="sm" />
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Continue Story
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Comments Sidebar */}
      <AnimatePresence>
        {showComments && (
          <CommentSystem
            storyId={storyId}
            onClose={() => setShowComments(false)}
          />
        )}
      </AnimatePresence>

      {/* Assessment Modal */}
      <AssessmentModal
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        assessment={currentAssessment}
        storyTitle={currentStory.title}
      />
    </div>
  );
};
