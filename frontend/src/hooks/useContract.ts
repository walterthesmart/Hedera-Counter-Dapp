/**
 * React hook for contract interaction
 */

import { useState, useEffect, useCallback } from 'react';
import { ContractInfo, UseContractReturn, WalletConnection } from '@/types';
import { getContractInfo, retryOperation } from '@/utils/hedera';
import { getWalletManager, formatWalletError } from '@/utils/wallet';
import { APP_CONFIG, ERROR_MESSAGES, UI_CONFIG, VALIDATION } from '@/utils/config';

export const useContract = (wallet: WalletConnection | null): UseContractReturn => {
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletManager = getWalletManager();

  // Refresh contract information
  const refresh = useCallback(async () => {
    if (!APP_CONFIG.contractId) {
      setError(ERROR_MESSAGES.CONTRACT_NOT_DEPLOYED);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contractInfo = await retryOperation(
        () => getContractInfo(APP_CONFIG.contractId, APP_CONFIG.network),
        3,
        1000
      );

      if (contractInfo) {
        setContract(contractInfo);
      } else {
        setError('Failed to fetch contract information');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Contract refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load contract info on mount and when wallet changes
  useEffect(() => {
    refresh();
  }, [refresh, wallet]);

  // Auto-refresh contract info periodically
  useEffect(() => {
    const interval = setInterval(refresh, UI_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  // Execute contract function with error handling
  const executeContractFunction = async (
    functionName: string,
    operation: () => Promise<any>,
    successMessage?: string
  ) => {
    if (!wallet) {
      setError(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (!contract) {
      setError(ERROR_MESSAGES.CONTRACT_NOT_DEPLOYED);
      return;
    }

    if (contract.isPaused) {
      setError(ERROR_MESSAGES.CONTRACT_PAUSED);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      if (result.success) {
        // Refresh contract state after successful transaction
        setTimeout(refresh, 2000); // Give some time for the transaction to be processed
        
        if (successMessage) {
          console.log(successMessage);
        }
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      const errorMessage = formatWalletError(error);
      setError(errorMessage);
      console.error(`${functionName} failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Increment counter
  const increment = useCallback(async () => {
    if (!contract) return;
    
    if (contract.count >= contract.maxCount) {
      setError(ERROR_MESSAGES.MAX_COUNT_EXCEEDED);
      return;
    }

    await executeContractFunction(
      'increment',
      () => walletManager.incrementCounter(APP_CONFIG.contractId),
      'Counter incremented successfully'
    );
  }, [contract, walletManager]);

  // Decrement counter
  const decrement = useCallback(async () => {
    if (!contract) return;
    
    if (contract.count <= contract.minCount) {
      setError(ERROR_MESSAGES.MIN_COUNT_EXCEEDED);
      return;
    }

    await executeContractFunction(
      'decrement',
      () => walletManager.decrementCounter(APP_CONFIG.contractId),
      'Counter decremented successfully'
    );
  }, [contract, walletManager]);

  // Increment counter by amount
  const incrementBy = useCallback(async (amount: number) => {
    if (!contract) return;

    // Validation
    if (amount < VALIDATION.MIN_INCREMENT_AMOUNT || amount > VALIDATION.MAX_INCREMENT_AMOUNT) {
      setError(`Amount must be between ${VALIDATION.MIN_INCREMENT_AMOUNT} and ${VALIDATION.MAX_INCREMENT_AMOUNT}`);
      return;
    }

    if (contract.count + amount > contract.maxCount) {
      setError(ERROR_MESSAGES.MAX_COUNT_EXCEEDED);
      return;
    }

    await executeContractFunction(
      'incrementBy',
      () => walletManager.incrementCounterBy(APP_CONFIG.contractId, amount),
      `Counter incremented by ${amount} successfully`
    );
  }, [contract, walletManager]);

  // Decrement counter by amount
  const decrementBy = useCallback(async (amount: number) => {
    if (!contract) return;

    // Validation
    if (amount < VALIDATION.MIN_DECREMENT_AMOUNT || amount > VALIDATION.MAX_DECREMENT_AMOUNT) {
      setError(`Amount must be between ${VALIDATION.MIN_DECREMENT_AMOUNT} and ${VALIDATION.MAX_DECREMENT_AMOUNT}`);
      return;
    }

    if (contract.count - amount < contract.minCount) {
      setError(ERROR_MESSAGES.MIN_COUNT_EXCEEDED);
      return;
    }

    await executeContractFunction(
      'decrementBy',
      () => walletManager.decrementCounterBy(APP_CONFIG.contractId, amount),
      `Counter decremented by ${amount} successfully`
    );
  }, [contract, walletManager]);

  // Reset counter (owner only)
  const reset = useCallback(async () => {
    if (!contract || !wallet) return;

    // Check if user is the owner
    const userAddress = `0x${wallet.accountId.replace(/\./g, '')}`;
    if (contract.owner.toLowerCase() !== userAddress.toLowerCase()) {
      setError('Only the contract owner can reset the counter');
      return;
    }

    await executeContractFunction(
      'reset',
      () => walletManager.resetCounter(APP_CONFIG.contractId),
      'Counter reset successfully'
    );
  }, [contract, wallet, walletManager]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    contract,
    increment,
    decrement,
    incrementBy,
    decrementBy,
    reset,
    refresh,
    isLoading,
    error,
  };
};
