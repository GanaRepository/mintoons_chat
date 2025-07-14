// utils/helpers.ts - General helper functions (consolidated from lib/)
import { STORY_ELEMENTS } from '@utils/constants';
import type { StoryElements } from '../types/story';
import type { AchievementProgress } from '../types/achievement';
import { LEVEL_THRESHOLDS } from '@utils/constants';
import { LEVEL_REWARDS } from '@utils/constants';
/**
 * Generate a random ID
 */
export function generateId(length: number = 8): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);

  if (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * chars.length);
    }
  }

  for (let i = 0; i < length; i++) {
    result += chars[array[i]! % chars.length];
  }
  return result;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for frequent events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

/**
 * Count characters excluding spaces
 */
export function countCharacters(text: string): number {
  return text.replace(/\s/g, '').length;
}

/**
 * Get reading time estimate
 */
export function getReadingTime(
  text: string,
  wordsPerMinute: number = 225
): number {
  const wordCount = countWords(text);
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate excerpt from text
 */
export function generateExcerpt(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Check if string is valid JSON
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse JSON safely with fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as T;

  // Type assertion to tell TypeScript we know this is an object
  const objAsRecord = obj as Record<string, any>;
  const clonedObj: Record<string, any> = {};

  for (const key in objAsRecord) {
    if (Object.prototype.hasOwnProperty.call(objAsRecord, key)) {
      clonedObj[key] = deepClone(objAsRecord[key]);
    }
  }
  return clonedObj as T;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  return Object.keys(obj).length === 0;
}

/**
 * Pick specific properties from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific properties from object
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Get unique values from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Shuffle array randomly
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Fix: Remove non-null assertions from destructuring assignment
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Get one random element from an array (works with *readonly* arrays too)
 */
export function randomItem<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)]!;
}

/**
 * Check if value is between min and max
 */
export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate random number between min and max
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if browser supports feature
 */
export function supportsFeature(feature: string): boolean {
  if (typeof window === 'undefined') return false;

  switch (feature) {
    case 'webp':
      return (() => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
      })();
    case 'localStorage':
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    case 'serviceWorker':
      return 'serviceWorker' in navigator;
    default:
      return false;
  }
}

/**
 * Get browser info
 */
export function getBrowserInfo() {
  if (typeof window === 'undefined') return null;

  const { userAgent } = navigator;
  const isChrome =
    /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari =
    /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isEdge = /Edg/.test(userAgent);

  return { isChrome, isFirefox, isSafari, isEdge, userAgent };
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch {
    return false;
  }
}

/**
 * Get URL parameters
 */
export function getUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);

  for (const [key, value] of searchParams) {
    params[key] = value;
  }

  return params;
}

/**
 * Build URL with parameters
 */
export function buildUrl(base: string, params: Record<string, any>): string {
  const url = new URL(base, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Format error message for display
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i === maxRetries) break;

      const delay = initialDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }

  throw lastError;
}

// utils/helpers.ts
export function getStoryStatusColor(
  status: string
): 'default' | 'purple' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'draft':
      return 'warning';
    case 'in_progress':
      return 'purple';
    case 'completed':
      return 'info';
    case 'published':
      return 'success';
    case 'archived':
      return 'error';
    default:
      return 'default';
  }
}

export function generateRandomElement(
  elementType: keyof StoryElements
): string {
  switch (elementType) {
    case 'genre':
      return randomItem(STORY_ELEMENTS.GENRES)?.name ?? '';
    case 'setting':
      return randomItem(STORY_ELEMENTS.SETTINGS)?.name ?? '';
    case 'character':
      return randomItem(STORY_ELEMENTS.CHARACTERS)?.name ?? '';
    case 'mood':
      return randomItem(STORY_ELEMENTS.MOODS)?.name ?? '';
    case 'conflict':
      return randomItem(STORY_ELEMENTS.CONFLICTS)?.name ?? '';
    case 'theme':
      return randomItem(STORY_ELEMENTS.THEMES)?.name ?? '';
    default:
      return '';
  }
}

// Add ONLY these missing functions to utils/helpers.ts (don't duplicate existing ones)

/**
 * Generate chart colors for analytics
 */
export function generateChartColors(chartType: string) {
  return {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    palette: [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
      '#F97316',
      '#6366F1',
    ],
  };
}

/**
 * Calculate trend from analytics data
 */
export function calculateTrend(data: Array<{ value: number }>) {
  if (data.length < 2) return null;

  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const percentage = firstValue !== 0 ? (change / firstValue) * 100 : 0;

  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : ('neutral' as const),
    percentage: Math.abs(percentage),
    change,
    isPositive: change > 0,
  };
}

/**
 * Process analytics data for charts
 */
export function processAnalyticsData(
  data: Array<{ date: string; value: number; label?: string }>,
  chartType: string,
  timeRange: string
) {
  if (!data || data.length === 0) return [];

  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (chartType === 'pie') {
    const aggregated: { [key: string]: number } = {};
    sorted.forEach(item => {
      const key = item.label || item.date;
      aggregated[key] = (aggregated[key] || 0) + item.value;
    });

    return Object.entries(aggregated).map(([name, value]) => ({
      name,
      value,
      date: name,
    }));
  }

  return sorted;
}

/**
 * Calculate AI cost optimization
 */
export function calculateAICostOptimization(metrics: {
  totalRequests: number;
  totalCost: number;
  totalTokensUsed: number;
}) {
  const avgCostPerRequest =
    metrics.totalRequests > 0 ? metrics.totalCost / metrics.totalRequests : 0;
  const potentialSavings = avgCostPerRequest * 0.15 * metrics.totalRequests;

  return {
    potentialSavings,
    recommendations: [
      'Consider using more efficient models for simple requests',
      'Implement request caching for repeated queries',
      'Optimize prompt length to reduce token usage',
    ],
  };
}

/**
 * Calculate tokens per story
 */
export function calculateTokensPerStory(
  totalTokens: number,
  totalStories: number
): number {
  return totalStories > 0 ? Math.round(totalTokens / totalStories) : 0;
}

/**
 * Calculate Monthly Recurring Revenue
 */
export function calculateMRR(subscriptionRevenue: number): number {
  return subscriptionRevenue; // Assuming monthly revenue
}

/**
 * Calculate Average Revenue Per User
 */
export function calculateARPU(
  totalRevenue: number,
  activeSubscribers: number
): number {
  return activeSubscribers > 0 ? totalRevenue / activeSubscribers : 0;
}

/**
 * Calculate Churn Rate
 */
export function calculateChurnRate(
  canceledSubscriptions: number,
  totalSubscriptions: number
): number {
  return totalSubscriptions > 0
    ? (canceledSubscriptions / totalSubscriptions) * 100
    : 0;
}

// Add these missing functions to utils/helpers.ts

/**
 * Calculate average rating from rating distribution
 */
export function calculateAverageRating(
  ratingDistribution: Array<{ score: number; count: number }>
): number {
  if (!ratingDistribution || ratingDistribution.length === 0) return 0;

  const totalRatings = ratingDistribution.reduce(
    (sum, rating) => sum + rating.count,
    0
  );
  if (totalRatings === 0) return 0;

  const weightedSum = ratingDistribution.reduce(
    (sum, rating) => sum + rating.score * rating.count,
    0
  );
  return weightedSum / totalRatings;
}

/**
 * Calculate engagement rate from views, likes, and comments
 */
export function calculateEngagementRate(
  views: number,
  likes: number,
  comments: number
): number {
  if (views === 0) return 0;

  const totalEngagements = likes + comments;
  return (totalEngagements / views) * 100;
}

// Add ONLY these 2 functions to utils/helpers.ts (don't add the others I mentioned)

/**
 * Calculate growth rate between current and previous values
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate retention rate
 */
export function calculateRetentionRate(
  activeUsers: number,
  totalUsers: number
): number {
  if (totalUsers === 0) return 0;
  return (activeUsers / totalUsers) * 100;
}

// Replace the calculateAchievementProgress function:
export function calculateAchievementProgress(
  achievement: any,
  user: any
): AchievementProgress {
  const criteria = achievement.criteria || {};
  let current = 0;
  let target = 1;

  if (criteria.storiesCompleted) {
    current = user.storyCount || 0;
    target = criteria.storiesCompleted;
  } else if (criteria.grammarScore) {
    current = user.bestGrammarScore || 0;
    target = criteria.grammarScore;
  } else if (criteria.creativityScore) {
    current = user.bestCreativityScore || 0;
    target = criteria.creativityScore;
  } else if (criteria.streakDays) {
    current = user.streak || 0;
    target = criteria.streakDays;
  } else if (criteria.totalWords) {
    current = user.totalWords || 0;
    target = criteria.totalWords;
  }

  return { current, target };
}

// Add these functions to utils/helpers.ts

/**
 * Calculate user level from total points
 */
export function calculateUserLevel(totalPoints: number): number {
  // Find the highest level threshold that the user has reached
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1; // Default to level 1
}

/**
 * Get points required for next level
 */
export function getPointsForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    // For levels beyond our threshold array, use exponential growth
    const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const growthRate = 1.2; // 20% increase per level
    return Math.floor(
      lastThreshold *
        Math.pow(growthRate, currentLevel - LEVEL_THRESHOLDS.length)
    );
  }
  return (
    LEVEL_THRESHOLDS[currentLevel] ||
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  );
}

/**
 * Get benefits for a specific level
 */
export function getLevelBenefits(level: number): string[] {
  // Get exact level benefits
  if (LEVEL_REWARDS[level]) {
    return [...LEVEL_REWARDS[level]]; // Create a copy to avoid mutability issues
  }

  // Get the highest available reward for levels beyond our defined rewards
  const availableLevels = Object.keys(LEVEL_REWARDS)
    .map(Number)
    .sort((a, b) => b - a);
  for (const availableLevel of availableLevels) {
    if (level >= availableLevel) {
      return [...LEVEL_REWARDS[availableLevel]]; // Create a copy
    }
  }

  // Default benefits for very low levels
  return ['Access to story creation', 'Basic features unlocked'];
}

// Add this function to utils/helpers.ts

/**
 * Play reward sound effect
 */
export function playRewardSound(): void {
  if (typeof window === 'undefined') return;

  try {
    // Create audio context for better browser support
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Create a simple reward sound using Web Audio API
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a pleasant reward sound (C major chord)
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    // Fallback: try to play a simple beep sound
    console.log('🎉 Reward earned!'); // Visual feedback in console if audio fails
  }
}

// Add these functions to utils/helpers.ts

/**
 * Calculate current streak from streak data
 */
export function calculateCurrentStreak(streakData: any): number {
  if (!streakData || !streakData.lastStoryDate) return 0;

  const lastStoryDate = new Date(streakData.lastStoryDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to start of day for accurate comparison
  lastStoryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  // If last story was today or yesterday, streak is active
  if (
    lastStoryDate.getTime() === today.getTime() ||
    lastStoryDate.getTime() === yesterday.getTime()
  ) {
    return streakData.current || 0;
  }

  // Otherwise streak is broken
  return 0;
}

/**
 * Check if streak is currently active
 */
export function isStreakActive(streakData: any): boolean {
  if (!streakData || !streakData.lastStoryDate) return false;

  const lastStoryDate = new Date(streakData.lastStoryDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to start of day for accurate comparison
  lastStoryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  // Streak is active if last story was today or yesterday
  return (
    lastStoryDate.getTime() === today.getTime() ||
    lastStoryDate.getTime() === yesterday.getTime()
  );
}

/**
 * Get motivational message based on streak
 */
export function getStreakMotivation(streak: number, isActive: boolean): string {
  if (!isActive && streak > 0) {
    return `Don't let your ${streak}-day streak end! Write a story today to keep the momentum going.`;
  }

  if (streak === 0) {
    return 'Every great writer started with a single story. Begin your writing streak today!';
  }

  if (streak === 1) {
    return 'Great start! Write another story tomorrow to build your streak.';
  }

  if (streak < 7) {
    return `You're building momentum! ${7 - streak} more days to reach your first weekly milestone.`;
  }

  if (streak < 14) {
    return `Amazing! You're on a roll. Keep writing to reach the two-week milestone.`;
  }

  if (streak < 30) {
    return `Incredible dedication! You're approaching the monthly milestone. Don't stop now!`;
  }

  return `You're a writing legend! Your consistency is truly inspiring. Keep the streak alive!`;
}

/**
 * Calculate reading time from character length and user age
 */
export function calculateReadingTime(
  characterLength: number,
  userAge: number
): number {
  // Convert character length to approximate word count (5 chars per word average)
  const wordCount = Math.ceil(characterLength / 5);

  // Age-appropriate words per minute
  const getWordsPerMinute = (age: number) => {
    if (age <= 8) return 100;
    if (age <= 12) return 150;
    if (age <= 16) return 200;
    return 225;
  };

  const wordsPerMinute = getWordsPerMinute(userAge);
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Share story using Web Share API or fallback to clipboard
 */
export async function shareStory(story: any): Promise<void> {
  const shareData = {
    title: story.title,
    text: `Check out this story: "${story.title}" by ${story.authorName}`,
    url: `${window.location.origin}/stories/${story.id}`,
  };

  try {
    // Use Web Share API if available
    if (navigator.share && typeof navigator.share === 'function') {
      await navigator.share(shareData);
      return;
    }

    // Fallback to copying URL to clipboard
    const shareUrl = shareData.url;
    await copyToClipboard(shareUrl);

    // You might want to show a toast notification here
    console.log('Story URL copied to clipboard!');
  } catch (error) {
    console.error('Error sharing story:', error);
    throw error;
  }
}

// Add these functions to utils/helpers.ts:

/**
 * Calculate usage percentage
 */
export function calculateUsagePercentage(
  current: number,
  limit: number
): number {
  if (limit === -1) return 0; // Unlimited plans show 0%
  return Math.min(100, Math.round((current / limit) * 100));
}

/**
 * Get days until reset
 */
export function getDaysUntilReset(resetDate: Date): number {
  const now = new Date();
  const diff = resetDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Add these to utils/helpers.ts

/**
 * Generate AI story prompt based on elements and content
 */
export async function generateStoryPrompt(params: {
  elements: any;
  currentContent: string;
  userAge: number;
  category: string;
}): Promise<string> {
  // Import the AI cost optimizer
  const { aiCostOptimizer } = await import('@/lib/ai/cost-optimizer');

  try {
    const storyPlan = await aiCostOptimizer.generateStoryPlan(
      params.elements,
      params.userAge
    );

    return storyPlan.prompts[0] || 'What happens next in your story?';
  } catch (error) {
    console.error('Error generating story prompt:', error);
    return 'What happens next in your story?';
  }
}

/**
 * Get age-appropriate prompts by category
 */
export function getAgeAppropriatePrompts(
  userAge: number,
  category: string
): string[] {
  const prompts = {
    general: {
      young: [
        'What does your character see first?',
        'Who becomes their friend?',
        'What fun thing happens next?',
        'How does everyone feel happy?',
      ],
      older: [
        'What challenge does your character face?',
        'How do they show courage?',
        'What do they learn about themselves?',
        'How does the story reach its conclusion?',
      ],
    },
    characters: {
      young: [
        'Describe a new friend your character meets',
        'What makes this character special?',
        'How do they help each other?',
        'What do they like to do together?',
      ],
      older: [
        'Introduce a character with an interesting background',
        'What motivates this character?',
        'How do they challenge your main character?',
        'What secrets might they be hiding?',
      ],
    },
    settings: {
      young: [
        'Describe a magical place they discover',
        'What sounds do they hear?',
        'What pretty things do they see?',
        'How does this place make them feel?',
      ],
      older: [
        'Paint a vivid picture of a new location',
        'What atmosphere does this place create?',
        'How does the setting affect the mood?',
        'What history does this place hold?',
      ],
    },
    plot: {
      young: [
        'Something surprising happens!',
        'A friendly helper appears',
        'They find something wonderful',
        'Everyone works together',
      ],
      older: [
        'An unexpected twist changes everything',
        'A difficult choice must be made',
        'A secret is revealed',
        'The stakes suddenly get higher',
      ],
    },
  };

  const ageGroup = userAge <= 8 ? 'young' : 'older';
  return (
    prompts[category as keyof typeof prompts]?.[ageGroup] ||
    prompts.general[ageGroup]
  );
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
