/**
 * Counter control buttons component
 */

import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { ContractInfo, WalletConnection } from '@/types';
import { VALIDATION } from '@/utils/config';

interface CounterControlsProps {
  contract: ContractInfo | null;
  wallet: WalletConnection | null;
  onIncrement: () => Promise<void>;
  onDecrement: () => Promise<void>;
  onIncrementBy: (amount: number) => Promise<void>;
  onDecrementBy: (amount: number) => Promise<void>;
  onReset: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const CounterControls: React.FC<CounterControlsProps> = ({
  contract,
  wallet,
  onIncrement,
  onDecrement,
  onIncrementBy,
  onDecrementBy,
  onReset,
  isLoading,
  error,
}) => {
  const [incrementAmount, setIncrementAmount] = useState<number>(1);
  const [decrementAmount, setDecrementAmount] = useState<number>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Check if user is the contract owner
  const isOwner = wallet && contract && 
    contract.owner.toLowerCase() === `0x${wallet.accountId.replace(/\./g, '')}`.toLowerCase();

  // Validation helpers
  const canIncrement = contract && !contract.isPaused && contract.count < contract.maxCount;
  const canDecrement = contract && !contract.isPaused && contract.count > contract.minCount;
  const canIncrementBy = (amount: number) => 
    contract && !contract.isPaused && 
    contract.count + amount <= contract.maxCount &&
    amount >= VALIDATION.MIN_INCREMENT_AMOUNT &&
    amount <= VALIDATION.MAX_INCREMENT_AMOUNT;
  const canDecrementBy = (amount: number) => 
    contract && !contract.isPaused && 
    contract.count - amount >= contract.minCount &&
    amount >= VALIDATION.MIN_DECREMENT_AMOUNT &&
    amount <= VALIDATION.MAX_DECREMENT_AMOUNT;

  if (!wallet) {
    return (
      <div className="card text-center">
        <div className="text-gray-500 mb-4">
          <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Connect your wallet to interact with the counter</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="card text-center">
        <div className="text-gray-500 mb-4">
          <div className="loading-spinner w-8 h-8 mx-auto mb-3" />
          <p>Loading contract information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-800 text-sm">{error}</p>
        </div>
      )}

      {/* Contract Status */}
      {contract.isPaused && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <p className="text-warning-800 text-sm font-medium">
            ⚠️ Contract is currently paused. Operations are disabled.
          </p>
        </div>
      )}

      {/* Basic Controls */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Basic Controls</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onIncrement}
            disabled={!canIncrement || isLoading}
            className="btn btn-success flex items-center justify-center space-x-2 py-4"
          >
            <Plus className="w-5 h-5" />
            <span>Increment (+1)</span>
          </button>
          
          <button
            onClick={onDecrement}
            disabled={!canDecrement || isLoading}
            className="btn btn-error flex items-center justify-center space-x-2 py-4"
          >
            <Minus className="w-5 h-5" />
            <span>Decrement (-1)</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Controls
          </button>
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Advanced Controls</h3>
          
          {/* Increment By Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Increment by Amount
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={incrementAmount}
                onChange={(e) => setIncrementAmount(Number(e.target.value))}
                min={VALIDATION.MIN_INCREMENT_AMOUNT}
                max={VALIDATION.MAX_INCREMENT_AMOUNT}
                className="input flex-1"
                placeholder="Enter amount"
              />
              <button
                onClick={() => onIncrementBy(incrementAmount)}
                disabled={!canIncrementBy(incrementAmount) || isLoading}
                className="btn btn-success flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Range: {VALIDATION.MIN_INCREMENT_AMOUNT} - {VALIDATION.MAX_INCREMENT_AMOUNT}
            </p>
          </div>

          {/* Decrement By Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decrement by Amount
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={decrementAmount}
                onChange={(e) => setDecrementAmount(Number(e.target.value))}
                min={VALIDATION.MIN_DECREMENT_AMOUNT}
                max={VALIDATION.MAX_DECREMENT_AMOUNT}
                className="input flex-1"
                placeholder="Enter amount"
              />
              <button
                onClick={() => onDecrementBy(decrementAmount)}
                disabled={!canDecrementBy(decrementAmount) || isLoading}
                className="btn btn-error flex items-center space-x-2"
              >
                <TrendingDown className="w-4 h-4" />
                <span>Subtract</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Range: {VALIDATION.MIN_DECREMENT_AMOUNT} - {VALIDATION.MAX_DECREMENT_AMOUNT}
            </p>
          </div>

          {/* Owner Controls */}
          {isOwner && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Owner Controls
              </h4>
              <button
                onClick={onReset}
                disabled={isLoading}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Counter</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                This will reset the counter to 0. Only the contract owner can perform this action.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="loading-spinner w-6 h-6" />
              <span className="text-gray-700">Processing transaction...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
