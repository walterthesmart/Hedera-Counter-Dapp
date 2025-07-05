/**
 * Counter display component
 */

import React from 'react';
import { TrendingUp, TrendingDown, RotateCcw, Pause, Play } from 'lucide-react';
import { CounterDisplayProps } from '@/types';

export const CounterDisplay: React.FC<CounterDisplayProps> = ({
  count,
  isLoading = false,
  maxCount = 1000000,
  minCount = 0,
  onRefresh,
}) => {
  // Calculate progress percentage
  const progress = maxCount > 0 ? (count / maxCount) * 100 : 0;
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (progress < 25) return 'bg-success-500';
    if (progress < 50) return 'bg-blue-500';
    if (progress < 75) return 'bg-warning-500';
    return 'bg-error-500';
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="card text-center">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Counter Value</h2>
            <p className="text-gray-600 mt-2">
              Current count on the Hedera blockchain
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn btn-secondary btn-sm flex items-center space-x-2"
              title="Refresh contract state"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Counter Display */}
      <div className="relative mb-8">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="flex items-center space-x-3">
              <div className="loading-spinner w-6 h-6" />
              <span className="text-gray-600">Updating...</span>
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 mb-6">
          <div className="text-6xl font-bold text-primary-600 mb-2 font-mono">
            {formatNumber(count)}
          </div>
          
          {count.toString() !== formatNumber(count) && (
            <div className="text-lg text-gray-600 font-mono">
              {count.toLocaleString()}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Min: {minCount.toLocaleString()}</span>
            <span>{progress.toFixed(1)}% of max</span>
            <span>Max: {formatNumber(maxCount)}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {minCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Minimum</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(maxCount)}
          </div>
          <div className="text-sm text-gray-600">Maximum</div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center space-x-4">
        {count === minCount && (
          <div className="badge badge-warning">
            At Minimum
          </div>
        )}
        
        {count === maxCount && (
          <div className="badge badge-error">
            At Maximum
          </div>
        )}
        
        {count > 0 && count < maxCount && (
          <div className="badge badge-success">
            Active
          </div>
        )}
      </div>
    </div>
  );
};
