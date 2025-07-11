// app/components/analytics/AIUsageChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  DollarSign, 
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Skeleton } from '@components/ui/skeleton';
import { Alert } from '@components/ui/alert';
import { ProgressBar } from '@components/ui/progress-bar';
import { DashboardChart } from './DashboardChart';
import { formatNumber, formatPrice, formatPercentage } from '@utils/formatters';
import { calculateAICostOptimization, calculateTokensPerStory } from '@utils/helpers';
import { getAIUsageAnalytics } from '@lib/analytics/reporter';
import { AI_CONFIG, aiProviderManager } from '@lib/ai/providers';
import type { AIUsageAnalytics, TimeRange } from '@types/analytics';
import type { AIProvider, AIModel } from '@types/ai';

interface AIUsageChartProps {
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showProviderBreakdown?: boolean;
  showOptimizationSuggestions?: boolean;
  className?: string;
}

export const AIUsageChart: React.FC<AIUsageChartProps> = ({
  timeRange = '30d',
  onTimeRangeChange,
  showProviderBreakdown = true,
  showOptimizationSuggestions = true,
  className
}) => {
  const [metrics, setMetrics] = useState<AIUsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAIUsageMetrics();
  }, [timeRange]);

  const fetchAIUsageMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAIUsageAnalytics(timeRange);
      setMetrics(data);
    } catch (error) {
      setError('Failed to load AI usage metrics');
      console.error('AI usage metrics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton lines={3} />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton height="300px" />
        </Card>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card className={`p-6 ${className}`}>
        <Alert variant="error" title="AI Usage Error">
          {error || 'No AI usage metrics available'}
        </Alert>
      </Card>
    );
  }

  const avgTokensPerStory = calculateTokensPerStory(metrics.totalTokensUsed, metrics.totalStories);
  const costOptimization = calculateAICostOptimization(metrics);

  const metricCards = [
    {
      title: 'Total AI Requests',
      value: formatNumber(metrics.totalRequests),
      change: ((metrics.totalRequests - (metrics.previousRequests || 0)) / (metrics.previousRequests || 1)) * 100,
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Tokens Used',
      value: formatNumber(metrics.totalTokensUsed),
      change: ((metrics.totalTokensUsed - (metrics.previousTokensUsed || 0)) / (metrics.previousTokensUsed || 1)) * 100,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'AI Costs',
      value: formatPrice(metrics.totalCost),
      change: ((metrics.totalCost - (metrics.previousCost || 0)) / (metrics.previousCost || 1)) * 100,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Avg Response Time',
      value: `${metrics.averageResponseTime?.toFixed(0)}ms`,
      change: ((metrics.averageResponseTime || 0) - (metrics.previousResponseTime || 0)) / (metrics.previousResponseTime || 1) * 100,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      isLowerBetter: true
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Usage Metric Cards */}
      <div className="grid grid-cols-1