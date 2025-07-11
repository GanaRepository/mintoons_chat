// app/components/subscription/BillingHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Calendar, 
  CreditCard,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Skeleton } from '@components/ui/skeleton';
import { Alert } from '@components/ui/alert';
import { formatDate, formatPrice } from '@utils/formatters';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import type { BillingHistory as BillingHistoryType, PaymentStatus } from '../../../types/subscription';

interface BillingHistoryProps {
  userId: string;
  className?: string;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({
  userId,
  className
}) => {
  const [billingHistory, setBillingHistory] = useState<BillingHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingHistory();
  }, [userId]);

  const fetchBillingHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subscription/billing-history');
      if (!response.ok) {
        throw new Error('Failed to fetch billing history');
      }
      
      const data = await response.json();
      setBillingHistory(data.billingHistory || []);
    } catch (error) {
      setError('Unable to load billing history. Please try again.');
      console.error('Billing history fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/subscription/invoices/${invoiceId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Invoice download failed:', error);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants = {
      succeeded: 'success',
      pending: 'warning',
      failed: 'error',
      canceled: 'default',
      requires_action: 'warning',
    } as const;

    const icons = {
      succeeded: Check,
      pending: RefreshCw,
      failed: AlertCircle,
      canceled: AlertCircle,
      requires_action: AlertCircle,
    };

    const Icon = icons[status];
    
    return (
      <Badge variant={variants[status]} className="flex items-center space-x-1">
        <Icon size={12} />
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          <Skeleton lines={1} width="60%" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="space-y-2">
                <Skeleton width="120px" height="16px" />
                <Skeleton width="80px" height="14px" />
              </div>
              <Skeleton width="60px" height="24px" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <Alert variant="error" title="Error Loading Billing History">
          {error}
        </Alert>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchBillingHistory}
          className="mt-4"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Billing History
        </h3>
        <Button variant="outline" size="sm" onClick={fetchBillingHistory}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {billingHistory.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No billing history found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Your payment history will appear here once you make your first payment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {billingHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <CreditCard className="text-purple-600" size={20} />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {SUBSCRIPTION_TIERS[item.tier]?.name || item.tier} Plan
                    </h4>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    {item.invoiceId && (
                      <span>Invoice #{item.invoiceId.slice(-8)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(item.amount)}
                  </div>
                  {item.status === 'failed' && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Payment failed
                    </div>
                  )}
                </div>

                {item.invoiceId && item.status === 'succeeded' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadInvoice(item.invoiceId!)}
                  >
                    <Download size={16} />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};