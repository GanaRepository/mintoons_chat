// app/components/analytics/RevenueChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Users,
  Target,
  Calendar
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Skeleton } from '@components/ui/skeleton';
import { DashboardChart } from './DashboardChart';
import { formatPrice, formatNumber, formatPercentage } from '@utils/formatters';
import { calculateMRR, calculateARPU, calculateChurnRate } from '@utils/helpers';
import { getRevenueAnalytics } from '@lib/analytics/reporter';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import type { RevenueAnalytics, TimeRange } from '../../../types/analytics';
import type { SubscriptionTierType } from '../../../types/subscription';

interface RevenueChartProps {
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showSubscriptionBreakdown?: boolean;
  className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  timeRange = '30d',
  onTimeRangeChange,
  showSubscriptionBreakdown = true,
  className
}) => {
  const [metrics, setMetrics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueMetrics();
  }, [timeRange]);

  const fetchRevenueMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getRevenueAnalytics(timeRange);
      setMetrics(data);
    } catch (error) {
      setError('Failed to load revenue metrics');
      console.error('Revenue metrics error:', error);
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
        <div className="text-center text-red-600 dark:text-red-400">
          {error || 'No revenue metrics available'}
        </div>
      </Card>
    );
  }

  const mrr = calculateMRR(metrics.subscriptionRevenue);
  const arpu = calculateARPU(metrics.totalRevenue, metrics.activeSubscribers);
  const churnRate = calculateChurnRate(metrics.canceledSubscriptions, metrics.totalSubscriptions);

  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(metrics.totalRevenue),
      change: ((metrics.totalRevenue - (metrics.previousRevenue || 0)) / (metrics.previousRevenue || 1)) * 100,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Monthly Recurring Revenue',
      value: formatPrice(mrr),
      change: ((mrr - (metrics.previousMRR || 0)) / (metrics.previousMRR || 1)) * 100,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Active Subscribers',
      value: formatNumber(metrics.activeSubscribers),
      change: ((metrics.activeSubscribers - (metrics.previousActiveSubscribers || 0)) / (metrics.previousActiveSubscribers || 1)) * 100,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Average Revenue Per User',
      value: formatPrice(arpu),
      change: ((arpu - (metrics.previousARPU || 0)) / (metrics.previousARPU || 1)) * 100,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Revenue Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={metric.color} size={24} />
                  </div>
                  
                  <Badge 
                    variant={isPositive ? 'success' : 'error'}
                    className="flex items-center space-x-1"
                  >
                    <TrendingUp 
                      size={12} 
                      className={!isPositive ? 'rotate-180' : ''} 
                    />
                    <span>{formatPercentage(Math.abs(metric.change))}</span>
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {metric.value}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Over Time Chart */}
      <DashboardChart
        title="Revenue Over Time"
        data={metrics.revenueData}
        chartType="area"
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
        showTrend={true}
        height={350}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Tier Breakdown */}
        {showSubscriptionBreakdown && (
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Revenue by Subscription Tier
            </h4>
            
            <div className="space-y-4">
              {Object.entries(SUBSCRIPTION_TIERS)
                .filter(([tier]) => tier !== 'FREE')
                .map(([tier, config]) => {
                  // Cast tier to SubscriptionTierType to satisfy type checking
                  const typedTier = tier as SubscriptionTierType;
                  const tierRevenue = metrics.subscriptionBreakdown?.[typedTier] || { revenue: 0, subscribers: 0, percentage: 0 };
                  return (
                    <div key={typedTier} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {typedTier}
                          </span>
                          <Badge variant="default" size="sm">
                            {formatPrice(config.price)}/mo
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatPrice(tierRevenue.revenue)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatNumber(tierRevenue.subscribers)} subscribers
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            typedTier === 'PRO' ? 'bg-purple-500' :
                            typedTier === 'PREMIUM' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${tierRevenue.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {/* Key Metrics */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Key Revenue Metrics
          </h4>
          
          <div className="space-y-6">
            {/* Churn Rate */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Churn Rate
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Monthly cancellation rate
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPercentage(churnRate)}
                </div>
                <Badge variant={churnRate > 10 ? 'error' : churnRate > 5 ? 'warning' : 'success'} size="sm">
                  {churnRate > 10 ? 'High' : churnRate > 5 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>

            {/* Customer Lifetime Value */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Lifetime Value
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Estimated CLV
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(metrics.customerLifetimeValue || 0)}
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Free to Paid Conversion
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Upgrade rate from free tier
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPercentage(metrics.conversionRate || 0)}
              </div>
            </div>

            {/* Revenue Growth Rate */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Revenue Growth Rate
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Month-over-month growth
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPercentage(metrics.revenueGrowthRate || 0)}
                </div>
                <Badge 
                  variant={(metrics.revenueGrowthRate || 0) > 0 ? 'success' : 'error'} 
                  size="sm"
                >
                  {(metrics.revenueGrowthRate || 0) > 0 ? '↗' : '↘'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Forecasting */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Forecast
        </h4>
        
        <DashboardChart
          title=""
          data={metrics.forecastData || []}
          chartType="line"
          height={250}
          showTrend={false}
        />
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(metrics.forecastedMRR || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Forecasted MRR (Next Month)
            </div>
          </div>
          
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(metrics.forecastedSubscribers || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Projected Subscribers
            </div>
          </div>
          
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPercentage(metrics.confidenceLevel || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Confidence Level
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};