// app/components/stories/AIAssistant.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Wand2, 
  Users, 
  MapPin, 
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Dropdown } from '@components/ui/dropdown';
import { generateStoryPrompt, getAgeAppropriatePrompts } from '@utils/helpers';
import { STORY_PROMPTS } from '@utils/constants';
import type { StoryElements } from '@types/story';

interface AIAssistantProps {
  storyElements: StoryElements;
  currentContent: string;
  userAge: number;
  onSuggestion: (suggestion: string) => void;
  isExpanded?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  storyElements,
  currentContent,
  userAge,
  onSuggestion,
  isExpanded: initialExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [isGenerating, setIsGenerating] = useState(false);

  const promptCategories = {
    general: {
      icon: Lightbulb,
      label: 'Story Ideas',
      prompts: getAgeAppropriatePrompts(userAge, 'general')
    },
    characters: {
      icon: Users,
      label: 'Character Ideas',
      prompts: getAgeAppropriatePrompts(userAge, 'characters')
    },
    settings: {
      icon: MapPin,
      label: 'Setting Ideas',
      prompts: getAgeAppropriatePrompts(userAge, 'settings')
    },
    plot: {
      icon: Wand2,
      label: 'Plot Twists',
      prompts: getAgeAppropriatePrompts(userAge, 'plot')
    }
  };

  const handleGenerateCustomPrompt = async () => {
    setIsGenerating(true);
    try {
      const customPrompt = await generateStoryPrompt({
        elements: storyElements,
        currentContent,
        userAge,
        category: activeCategory
      });
      onSuggestion(customPrompt);
    } catch (error) {
      console.error('Failed to generate custom prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    onSuggestion(prompt);
  };

  const currentCategory = promptCategories[activeCategory as keyof typeof promptCategories];
  const Icon = currentCategory.icon;

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 'auto' }}
        className="overflow-hidden"
      >
        <Card className={`transition-all duration-300 ${isExpanded ? 'shadow-lg' : 'shadow-md'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Zap className="text-purple-600" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    AI Writing Assistant
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get inspiration for your story
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 space-y-4"
              >
                {/* Category Selector */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(promptCategories).map(([key, category]) => {
                    const CategoryIcon = category.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeCategory === key
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <CategoryIcon size={14} />
                        <span>{category.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Current Story Elements */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Your Story Elements:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(storyElements).map(([key, value]) => (
                      <Badge key={key} variant="default" size="sm">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* AI-Generated Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Custom AI Suggestion
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCustomPrompt}
                      disabled={isGenerating}
                      isLoading={isGenerating}
                    >
                      <RefreshCw size={14} className="mr-1" />
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Icon size={14} className="mr-2" />
                    {currentCategory.label}
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {currentCategory.prompts.slice(0, 4).map((prompt, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handlePromptSelect(prompt)}
                        className="w-full text-left p-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Writing Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                    💡 Writing Tip
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {userAge <= 8 
                      ? "Use your imagination! What would make you excited to read more?"
                      : userAge <= 12
                      ? "Try adding dialogue to make your characters come alive!"
                      : "Show, don't tell. Instead of saying 'he was scared', describe how his hands shook."
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};