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

    console.log('Loading contract info for:', APP_CONFIG.contractId, 'on network:', APP_CONFIG.network);
    setIsLoading(true);
    setError(null);

    try {
      // For now, let's create a mock contract to test the UI
      console.log('Creating mock contract for testing...');

      setContract({
        contractId: APP_CONFIG.contractId,
        count: 42, // Mock count
        owner: '0x0000000000000000000000000000000000000000',
        isPaused: false,
        maxCount: 1000000,
        minCount: 0,
      });

      console.log('Mock contract created successfully');

      // TODO: Uncomment this when we have a working contract
      /*
      // First, let's try to verify the contract exists using Mirror Node
      const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${APP_CONFIG.contractId}`;
      console.log('Checking contract existence via Mirror Node:', mirrorNodeUrl);

      const mirrorResponse = await fetch(mirrorNodeUrl);
      if (!mirrorResponse.ok) {
        throw new Error(`Contract ${APP_CONFIG.contractId} not found on Mirror Node. Status: ${mirrorResponse.status}`);
      }

      const mirrorData = await mirrorResponse.json();
      console.log('Mirror Node contract data:', mirrorData);

      // Try a simpler approach - just get the count first
      console.log('Trying to get count from contract...');
      const { getCounterValue } = await import('@/utils/hedera');
      const count = await getCounterValue(APP_CONFIG.contractId, APP_CONFIG.network);

      if (count !== null) {
        console.log('Successfully got count:', count);
        // If we can get the count, create a basic contract info object
        setContract({
          contractId: APP_CONFIG.contractId,
          count: count,
          owner: 'Unknown', // We'll get this later
          isPaused: false, // We'll get this later
          maxCount: 1000000, // Default from contract
          minCount: 0, // Default from contract
        });
      } else {
        // Try the full contract info function
        console.log('Count failed, trying full contract info...');
        const contractInfo = await retryOperation(
          () => getContractInfo(APP_CONFIG.contractId, APP_CONFIG.network),
          3,
          1000
        );

        console.log('Contract info result:', contractInfo);

        if (contractInfo) {
          setContract(contractInfo);
        } else {
          setError(`Failed to fetch contract information for ${APP_CONFIG.contractId}. The contract exists but may not have the expected functions.`);
        }
      }
      */
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Contract connection failed: ${errorMessage}`);
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
