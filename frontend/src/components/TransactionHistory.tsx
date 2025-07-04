/**
 * Transaction history component
 */

import React from 'react';
import { ExternalLink, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { TransactionHistoryProps, Transaction } from '@/types';
import { getTransactionExplorerUrl } from '@/utils/hedera';

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  network,
}) => {
  // Get icon for transaction type
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'increment':
      case 'incrementBy':
        return <TrendingUp className="w-4 h-4 text-success-600" />;
      case 'decrement':
      case 'decrementBy':
        return <TrendingDown className="w-4 h-4 text-error-600" />;
      case 'reset':
        return <RotateCcw className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: <div className="loading-spinner w-4 h-4" />,
          color: 'text-warning-600',
          bg: 'bg-warning-100',
          text: 'Pending',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-success-600',
          bg: 'bg-success-100',
          text: 'Success',
        };
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'text-error-600',
          bg: 'bg-error-100',
          text: 'Failed',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          text: 'Unknown',
        };
    }
  };

  // Format transaction type for display
  const formatTransactionType = (type: Transaction['type'], amount?: number) => {
    switch (type) {
      case 'increment':
        return 'Increment (+1)';
      case 'decrement':
        return 'Decrement (-1)';
      case 'incrementBy':
        return `Increment (+${amount || 0})`;
      case 'decrementBy':
        return `Decrement (-${amount || 0})`;
      case 'reset':
        return 'Reset Counter';
      default:
        return 'Unknown';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (transactions.length === 0) {
    return (
      <div className="card text-center">
        <div className="text-gray-500 mb-4">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
          <p>Your transaction history will appear here once you start interacting with the contract.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <p className="text-gray-600 text-sm">
          Recent interactions with the counter contract
        </p>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => {
          const statusDisplay = getStatusDisplay(transaction.status);
          
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Transaction Type Icon */}
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatTransactionType(transaction.type, transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(transaction.timestamp)}
                  </p>
                  {transaction.error && (
                    <p className="text-xs text-error-600 mt-1">
                      {transaction.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Status Badge */}
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                  <span className="mr-1">{statusDisplay.icon}</span>
                  {statusDisplay.text}
                </div>

                {/* Explorer Link */}
                {transaction.hash && transaction.status === 'success' && (
                  <a
                    href={getTransactionExplorerUrl(transaction.hash, network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                    title="View on HashScan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more button if there are many transactions */}
      {transactions.length >= 10 && (
        <div className="mt-4 text-center">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
};
