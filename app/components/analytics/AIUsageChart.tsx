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
import { Card } from '../ui/card';
import { Alert } from '../ui/alert';
import { formatNumber, formatPrice, formatPercentage } from '@utils/formatters';

// Define types locally since @types/analytics doesn't exist
interface AIUsageAnalytics {
  totalRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  totalStories: number;
  previousRequests?: number;
  previousTokensUsed?: number;
  previousCost?: number;
  previousResponseTime?: number;
  providerBreakdown: Array<{
    provider: string;
    requests: number;
    cost: number;
    responseTime: number;
  }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    cost: number;
  }>;
}

type TimeRange = '7d' | '30d' | '90d' | '1y';

interface AIUsageChartProps {
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showProviderBreakdown?: boolean;
  showOptimizationSuggestions?: boolean;
  className?: string;
}

// Simple helper functions to replace missing ones
const calculateTokensPerStory = (totalTokens: number, totalStories: number): number => {
  return totalStories > 0 ? Math.round(totalTokens / totalStories) : 0;
};

const calculateAICostOptimization = (metrics: AIUsageAnalytics) => {
  const avgCostPerRequest = metrics.totalRequests > 0 ? metrics.totalCost / metrics.totalRequests : 0;
  const potentialSavings = avgCostPerRequest * 0.15;
  
  return {
    potentialSavings,
    recommendations: [
      'Consider using more efficient models for simple requests',
      'Implement request caching for repeated queries',
      'Optimize prompt length to reduce token usage'
    ]
  };
};

// Mock function since getAIUsageAnalytics doesn't exist
const getAIUsageAnalytics = async (timeRange: TimeRange): Promise<AIUsageAnalytics> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    totalRequests: 1250,
    totalTokensUsed: 125000,
    totalCost: 45.50,
    averageResponseTime: 850,
    totalStories: 89,
    previousRequests: 1100,
    previousTokensUsed: 110000,
    previousCost: 42.30,
    previousResponseTime: 920,
    providerBreakdown: [
      { provider: 'OpenAI', requests: 800, cost: 30.20, responseTime: 750 },
      { provider: 'Anthropic', requests: 300, cost: 12.10, responseTime: 950 },
      { provider: 'Google', requests: 150, cost: 3.20, responseTime: 1100 }
    ],
    dailyUsage: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      requests: Math.floor(Math.random() * 50) + 20,
      cost: Math.floor(Math.random() * 5) + 1
    }))
  };
};

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
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </Card>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card className={className}>
        <Alert variant="error">
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
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Tokens Used',
      value: formatNumber(metrics.totalTokensUsed),
      change: ((metrics.totalTokensUsed - (metrics.previousTokensUsed || 0)) / (metrics.previousTokensUsed || 1)) * 100,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'AI Costs',
      value: formatPrice(Math.round(metrics.totalCost * 100)),
      change: ((metrics.totalCost - (metrics.previousCost || 0)) / (metrics.previousCost || 1)) * 100,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg Response Time',
      value: `${metrics.averageResponseTime?.toFixed(0)}ms`,
      change: ((metrics.averageResponseTime || 0) - (metrics.previousResponseTime || 0)) / (metrics.previousResponseTime || 1) * 100,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      isLowerBetter: true
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full border ${
                  metric.isLowerBetter 
                    ? (metric.change < 0 ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200')
                    : (metric.change > 0 ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200')
                }`}>
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {showProviderBreakdown && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Provider Breakdown</h3>
          <div className="space-y-4">
            {metrics.providerBreakdown.map((provider, index) => (
              <div key={provider.provider} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-purple-500' : 
                    index === 1 ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <span className="font-medium">{provider.provider}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{formatNumber(provider.requests)} requests</span>
                  <span>{formatPrice(Math.round(provider.cost * 100))}</span>
                  <span>{provider.responseTime}ms</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showOptimizationSuggestions && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cost Optimization</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Potential monthly savings:</span>
              <span className="text-sm px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                {formatPrice(Math.round(costOptimization.potentialSavings * 100))}
              </span>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {costOptimization.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Daily Usage Trend</h3>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange?.(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 flex items-end space-x-1">
          {metrics.dailyUsage.slice(0, 30).map((day, index) => (
            <div
              key={day.date}
              className="flex-1 bg-blue-200 rounded-t hover:bg-blue-300 transition-colors cursor-pointer"
              style={{
                height: `${(day.requests / 70) * 100}%`,
                minHeight: '4px'
              }}
              title={`${day.requests} requests on ${new Date(day.date).toLocaleDateString()}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </Card>
    </div>
  );
};