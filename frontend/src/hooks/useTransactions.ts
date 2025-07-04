/**
 * React hook for transaction management
 */

import { useState, useCallback } from 'react';
import { Transaction, UseTransactionsReturn, TransactionStatus } from '@/types';
import { UI_CONFIG } from '@/utils/config';

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Add a new transaction
  const addTransaction = useCallback((
    transaction: Omit<Transaction, 'id' | 'timestamp'>
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateTransactionId(),
      timestamp: Date.now(),
    };

    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      // Keep only the most recent transactions
      return updated.slice(0, UI_CONFIG.MAX_TRANSACTIONS_HISTORY);
    });
  }, []);

  // Update an existing transaction
  const updateTransaction = useCallback((
    id: string, 
    updates: Partial<Transaction>
  ) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === id ? { ...tx, ...updates } : tx
      )
    );
  }, []);

  // Clear all transactions
  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  // Get transactions by status
  const getTransactionsByStatus = useCallback((status: TransactionStatus) => {
    return transactions.filter(tx => tx.status === status);
  }, [transactions]);

  // Get pending transactions
  const getPendingTransactions = useCallback(() => {
    return getTransactionsByStatus('pending');
  }, [getTransactionsByStatus]);

  // Get successful transactions
  const getSuccessfulTransactions = useCallback(() => {
    return getTransactionsByStatus('success');
  }, [getTransactionsByStatus]);

  // Get failed transactions
  const getFailedTransactions = useCallback(() => {
    return getTransactionsByStatus('error');
  }, [getTransactionsByStatus]);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    clearTransactions,
    getTransactionsByStatus,
    getPendingTransactions,
    getSuccessfulTransactions,
    getFailedTransactions,
  };
};

// Helper function to generate unique transaction IDs
const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
