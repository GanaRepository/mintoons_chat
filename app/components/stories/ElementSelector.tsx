'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';

import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { STORY_ELEMENTS } from '@utils/constants';
import { generateRandomElement } from '@utils/helpers';
import type { StoryElements } from '../../../types/story';

/* ------------------------------------------------------------------ */
/*  Helpers & Types                                                   */
/* ------------------------------------------------------------------ */

type ElementCategory = keyof typeof STORY_ELEMENTS; // 'GENRES' | …
type ElementKey = keyof StoryElements; // 'genre' | …

const categoryToKey: Record<ElementCategory, ElementKey> = {
  GENRES: 'genre',
  SETTINGS: 'setting',
  CHARACTERS: 'character',
  MOODS: 'mood',
  CONFLICTS: 'conflict',
  THEMES: 'theme',
};

type ElementOption = (typeof STORY_ELEMENTS)[ElementCategory][number];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface ElementSelectorProps {
  elements: typeof STORY_ELEMENTS; // <-- FIXED TYPE
  selectedElements: Partial<StoryElements>;
  onElementsChange: (elements: Partial<StoryElements>) => void;
  onComplete: (elements: StoryElements) => void | Promise<void>;
  userAge: number;
}

export const ElementSelector: React.FC<ElementSelectorProps> = ({
  elements,
  selectedElements,
  onElementsChange,
  onComplete,
  userAge,
}) => {
  const [animatingElement, setAnimatingElement] =
    useState<ElementCategory | null>(null);

  const categories = Object.keys(STORY_ELEMENTS) as ElementCategory[];
  const completed = categories.filter(
    cat => selectedElements[categoryToKey[cat]]
  );
  const isComplete = completed.length === 6;
  const isDisabled = !!animatingElement; // or set your own logic

  // Handler for changing an element
  const onElementChange = (key: ElementKey, value: string) => {
    onElementsChange({
      ...selectedElements,
      [key]: value,
    });
  };

  /* -------------------------- handlers --------------------------- */

  const handleRandom = (cat: ElementCategory) => {
    if (isDisabled) return;
    setAnimatingElement(cat);

    setTimeout(() => {
      const key = categoryToKey[cat];
      const value = generateRandomElement(key);
      onElementChange(key, value);
      setAnimatingElement(null);
    }, 500);
  };

  const handleSelect = (cat: ElementCategory, optionName: string) => {
    if (isDisabled) return;
    onElementChange(categoryToKey[cat], optionName);
  };

  /* ---------------------------- UI ------------------------------ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-center space-x-2"
        >
          <Sparkles className="text-purple-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Choose Your Story Elements
          </h2>
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400">
          Select 6 elements to create your unique story
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-center space-x-2">
            {categories.map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`h-2 w-8 rounded-full ${
                  selectedElements[categoryToKey[cat]]
                    ? 'bg-purple-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {completed.length}/6 elements selected
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {categories.map((cat, i) => {
          const key = categoryToKey[cat];
          const options: ElementOption[] = STORY_ELEMENTS[cat].slice(0, 4);

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6">
                {/* Card header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                    {key}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRandom(cat)}
                    disabled={isDisabled}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <motion.div
                      animate={
                        animatingElement === cat ? { rotate: 360 } : undefined
                      }
                      transition={{ duration: 0.5 }}
                    >
                      <RefreshCw size={16} />
                    </motion.div>
                  </Button>
                </div>

                {/* Selected value */}
                <AnimatePresence mode="wait">
                  {selectedElements[key] ? (
                    <motion.div
                      key={selectedElements[key]}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="mb-4"
                    >
                      <Badge
                        variant="purple"
                        size="lg"
                        className="w-full justify-center py-2"
                      >
                        {selectedElements[key]}
                      </Badge>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4 flex h-10 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                    >
                      <span className="text-sm text-gray-400">
                        Click an option below
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Option buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {options.map(option => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(cat, option.name)}
                      disabled={isDisabled}
                      className={`rounded-lg border p-2 text-sm transition-colors ${
                        selectedElements[key] === option.name
                          ? 'border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-600 dark:bg-purple-900/20 dark:text-purple-300'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.name}
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Complete button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => onComplete(selectedElements as StoryElements)}
          disabled={!isComplete || isDisabled}
          className="px-8"
        >
          <Sparkles size={20} className="mr-2" />
          Start Writing My Story
        </Button>

        {!isComplete && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Select all 6 elements to continue
          </p>
        )}
      </motion.div>
    </div>
  );
};