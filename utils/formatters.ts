import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { AGE_GROUPS, ASSESSMENT_CRITERIA, SUBSCRIPTION_STATUS } from './constants';

/**
 * Format price - handles both cents and dollars
 */
export function formatPrice(price: number, isInCents: boolean = true): string {
  if (price === 0) return 'Free';

  if (isInCents) {
    return `$${(price / 100).toFixed(2)}`;
  } else {
    return `$${price.toFixed(2)}`;
  }
}

/**
 * Format price with monthly period
 */
export function formatPriceWithPeriod(priceInCents: number): string {
  if (priceInCents === 0) return 'Free';
  return `${formatPrice(priceInCents)}/month`;
}

/**
 * Format number with commas (1,234)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentage (0.75 -> 75%)
 */
export function formatPercentage(decimal: number, decimals: number = 0): string {
  return `${(decimal * 100).toFixed(decimals)}%`;
}

/**
 * Format file size (bytes to human readable)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format story count with proper pluralization
 */
export function formatStoryCount(count: number): string {
  return `${count} ${count === 1 ? 'story' : 'stories'}`;
}

/**
 * Format story remaining count
 */
export function formatRemainingStories(remaining: number, total: number): string {
  if (remaining === 0) return 'No stories remaining';
  return `${remaining} of ${total} stories remaining`;
}

/**
 * Format date to readable format
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    return format(dateObj, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    return format(dateObj, 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format relative time (2 hours ago)
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format assessment score with label using constants
 */
export function formatAssessmentScore(score: number): {
  score: string;
  label: string;
  color: string;
} {
  const formattedScore = `${score}/100`;

  if (score >= ASSESSMENT_CRITERIA.OVERALL.EXCELLENT.min) {
    return { 
      score: formattedScore, 
      label: ASSESSMENT_CRITERIA.OVERALL.EXCELLENT.label, 
      color: ASSESSMENT_CRITERIA.OVERALL.EXCELLENT.color 
    };
  } else if (score >= ASSESSMENT_CRITERIA.OVERALL.GOOD.min) {
    return { 
      score: formattedScore, 
      label: ASSESSMENT_CRITERIA.OVERALL.GOOD.label, 
      color: ASSESSMENT_CRITERIA.OVERALL.GOOD.color 
    };
  } else if (score >= ASSESSMENT_CRITERIA.OVERALL.FAIR.min) {
    return { 
      score: formattedScore, 
      label: ASSESSMENT_CRITERIA.OVERALL.FAIR.label, 
      color: ASSESSMENT_CRITERIA.OVERALL.FAIR.color 
    };
  } else {
    return { 
      score: formattedScore, 
      label: ASSESSMENT_CRITERIA.OVERALL.NEEDS_IMPROVEMENT.label, 
      color: ASSESSMENT_CRITERIA.OVERALL.NEEDS_IMPROVEMENT.color 
    };
  }
}

/**
 * Format word count with target range
 */
export function formatWordCount(
  current: number,
  min: number = 300,
  max: number = 600
): {
  count: string;
  status: 'under' | 'in-range' | 'over';
  color: string;
} {
  const count = `${current} words`;

  if (current < min) {
    return { count, status: 'under', color: 'red' };
  } else if (current > max) {
    return { count, status: 'over', color: 'orange' };
  } else {
    return { count, status: 'in-range', color: 'green' };
  }
}

/**
 * Format user name with fallback
 */
export function formatUserName(user: {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}): string {
  // Check for first and last name
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  // Check for full name
  if (user.name && user.name.trim()) {
    return user.name;
  }

  // Check for email and extract username
  if (user.email && user.email.trim()) {
    const emailParts = user.email.split('@');
    return emailParts[0] || 'Anonymous User';
  }

  return 'Anonymous User';
}

/**
 * Format age group from age using constants
 */
export function formatAgeGroup(age: number): string {
  for (const group of Object.values(AGE_GROUPS)) {
    if (age >= group.min && age <= group.max) {
      return group.label;
    }
  }
  return 'Unknown';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format initials from name
 */
export function formatInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Format streak count
 */
export function formatStreak(days: number): string {
  if (days === 0) return 'No streak';
  if (days === 1) return '1 day streak';
  return `${days} day streak`;
}

/**
 * Format achievement points
 */
export function formatPoints(points: number): string {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k points`;
  }
  return `${points} points`;
}

/**
 * Format reading time estimate
 */
export function formatReadingTime(wordCount: number): string {
  // Average reading speed: 200-250 words per minute for children
  const wordsPerMinute = 225;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

/**
 * Format subscription status using constants
 */
export function formatSubscriptionStatus(status: string): {
  label: string;
  color: string;
} {
  switch (status) {
    case SUBSCRIPTION_STATUS.ACTIVE:
      return { label: 'Active', color: 'green' };
    case SUBSCRIPTION_STATUS.CANCELED:
      return { label: 'Canceled', color: 'red' };
    case SUBSCRIPTION_STATUS.PAST_DUE:
      return { label: 'Past Due', color: 'orange' };
    case SUBSCRIPTION_STATUS.TRIALING:
      return { label: 'Trial', color: 'blue' };
    case SUBSCRIPTION_STATUS.INCOMPLETE:
      return { label: 'Incomplete', color: 'yellow' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
}

/**
 * Format error message
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Format time ago (alias for formatRelativeTime for compatibility)
 */
export function formatTimeAgo(date: string | Date): string {
  return formatRelativeTime(date);
}