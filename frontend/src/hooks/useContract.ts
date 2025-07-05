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

  // Sync wallet state with wallet manager
  useEffect(() => {
    walletManager.setCurrentWallet(wallet);
  }, [wallet, walletManager]);

  // Refresh contract information
  const refresh = useCallback(async (force = false) => {
    if (!APP_CONFIG.contractId) {
      setError(ERROR_MESSAGES.CONTRACT_NOT_DEPLOYED);
      return;
    }

    setIsLoading(true);
    setError(null);

    // If force refresh, clear current contract state first
    if (force) {
      setContract(null);
    }

    try {
      let contractData = null;

      // If MetaMask is connected, use it to fetch real contract state
      if (wallet?.walletType === 'metamask' && wallet.isConnected) {
        try {
          const { metaMaskWallet, hederaContractIdToEvmAddress } = await import('@/utils/metamask');
          const contractAddress = hederaContractIdToEvmAddress(APP_CONFIG.contractId);

          // Get real contract state
          console.log('🔍 Querying contract at address:', contractAddress);
          const debugInfo = await metaMaskWallet.debugContractState(contractAddress);
          console.log('🔍 Contract query result:', debugInfo);

          if (debugInfo && !debugInfo.error) {
            contractData = {
              contractId: APP_CONFIG.contractId,
              count: debugInfo.currentCount,
              owner: debugInfo.owner,
              isPaused: debugInfo.isPaused,
              maxCount: debugInfo.maxCount,
              minCount: debugInfo.minCount,
            };
            console.log('✅ Contract state loaded via MetaMask:', contractData);
          } else {
            console.log('❌ debugContractState failed, trying simple count method');
            // Try simpler approach - just get the count
            try {
              const count = await metaMaskWallet.getContractCount(contractAddress);
              console.log('🔍 Simple count result:', count);
              if (count !== null) {
                contractData = {
                  contractId: APP_CONFIG.contractId,
                  count: count,
                  owner: '0x0000000000000000000000000000000000000000', // Default
                  isPaused: false,
                  maxCount: 1000000,
                  minCount: 0,
                };
              } else {
                throw new Error('getContractCount returned null');
              }
            } catch (simpleError) {
              console.log('❌ Simple count method also failed:', simpleError);
              // Final fallback to mock data
              contractData = {
                contractId: APP_CONFIG.contractId,
                count: 0,
                owner: '0x0000000000000000000000000000000000000000',
                isPaused: false,
                maxCount: 1000000,
                minCount: 0,
              };
              console.log('🔄 Using MetaMask fallback data');
            }
          }
        } catch (metamaskError) {
          console.warn('❌ MetaMask contract query failed:', metamaskError);
        }
      }

      // If MetaMask failed or not connected, try Hedera SDK
      if (!contractData) {
        console.log('🔗 Trying Hedera SDK fallback...');
        try {
          // First, verify contract exists using Mirror Node
          const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${APP_CONFIG.contractId}`;
          console.log('🔍 Checking Mirror Node:', mirrorNodeUrl);

          const mirrorResponse = await fetch(mirrorNodeUrl);
          if (mirrorResponse.ok) {

            // Try to get the actual contract info using Hedera SDK
            const { getCounterValue, getContractOwner, isContractPaused } = await import('@/utils/hedera');

            // Get individual contract properties
            const [count, owner, isPaused] = await Promise.allSettled([
              getCounterValue(APP_CONFIG.contractId, APP_CONFIG.network),
              getContractOwner(APP_CONFIG.contractId, APP_CONFIG.network),
              isContractPaused(APP_CONFIG.contractId, APP_CONFIG.network)
            ]);

            // Use real data if available
            if (count.status === 'fulfilled' && count.value !== null) {
              contractData = {
                contractId: APP_CONFIG.contractId,
                count: count.value,
                owner: owner.status === 'fulfilled' && owner.value ? owner.value : '0.0.6255971',
                isPaused: isPaused.status === 'fulfilled' ? isPaused.value : false,
                maxCount: 1000000,
                minCount: 0,
              };
              console.log('✅ Contract state loaded via Hedera SDK:', contractData);
            } else {
              console.log('❌ Hedera SDK queries failed:', { count, owner, isPaused });
            }
          }
        } catch (hederaError) {
          console.warn('❌ Hedera SDK contract query failed:', hederaError);
        }
      }

      // If all real queries failed, use fallback data
      if (!contractData) {
        console.log('⚠️ All contract queries failed, using fallback data');
        contractData = {
          contractId: APP_CONFIG.contractId,
          count: 0, // Default to 0 instead of hardcoded 42
          owner: '0.0.6255971', // Use the actual deployer account from deployment.json
          isPaused: false,
          maxCount: 1000000,
          minCount: 0,
        };
      }

      setContract(contractData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Contract connection failed: ${errorMessage}`);
      console.error('Contract refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

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
  ): Promise<any> => {
    console.log('executeContractFunction called:', {
      functionName,
      wallet: !!wallet,
      walletConnected: wallet?.isConnected,
      contract: !!contract
    });

    // For development, we'll allow execution even without a real wallet connection
    // In production, you would enforce wallet connection here

    if (!contract) {
      console.error('Contract not available');
      setError(ERROR_MESSAGES.CONTRACT_NOT_DEPLOYED);
      return;
    }

    if (contract.isPaused) {
      console.error('Contract is paused');
      setError(ERROR_MESSAGES.CONTRACT_PAUSED);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Executing operation...');
      const result = await operation();
      console.log('Operation result:', result);

      // Check if the operation was successful
      if (result && result.success) {
        // Update the contract count immediately for better UX
        if (functionName === 'increment' && contract) {
          setContract(prev => prev ? { ...prev, count: prev.count + 1 } : null);
        } else if (functionName === 'decrement' && contract) {
          setContract(prev => prev ? { ...prev, count: prev.count - 1 } : null);
        } else if (functionName === 'incrementBy' && contract && result.amount) {
          setContract(prev => prev ? { ...prev, count: prev.count + result.amount } : null);
        } else if (functionName === 'decrementBy' && contract && result.amount) {
          setContract(prev => prev ? { ...prev, count: prev.count - result.amount } : null);
        }

        if (successMessage) {
          console.log(successMessage);
        }

        // Refresh contract state after successful transaction
        console.log('🔄 Transaction successful, refreshing contract state...');

        // Multiple refreshes to ensure we get the latest state
        // Immediate force refresh to clear cached state
        refresh(true);

        // Delayed refreshes to account for blockchain confirmation time
        setTimeout(() => refresh(true), 2000);
        setTimeout(() => refresh(true), 5000);

        // Return the result for transaction tracking
        return result;
      } else {
        throw new Error(result?.error || 'Transaction failed');
      }

    } catch (error) {
      const errorMessage = formatWalletError(error);
      setError(errorMessage);
      console.error(`${functionName} failed:`, error);

      // If using MetaMask, get debug information
      if (wallet?.walletType === 'metamask') {
        try {
          const { metaMaskWallet, hederaContractIdToEvmAddress } = await import('@/utils/metamask');
          const contractAddress = hederaContractIdToEvmAddress(APP_CONFIG.contractId);
          const debugInfo = await metaMaskWallet.debugContractState(contractAddress);
          console.log('🔍 Debug info after error:', debugInfo);
        } catch (debugError) {
          console.warn('Could not get debug info:', debugError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Increment counter
  const increment = useCallback(async () => {
    console.log('increment called', { contract: !!contract, wallet: !!wallet });

    if (!contract) {
      console.log('No contract available');
      return;
    }

    if (!wallet?.isConnected) {
      setError('Please connect your wallet to perform transactions');
      return;
    }

    if (contract.count >= contract.maxCount) {
      setError(ERROR_MESSAGES.MAX_COUNT_EXCEEDED);
      return;
    }

    return await executeContractFunction(
      'increment',
      async () => {
        console.log('Executing real increment transaction...');
        // Call the actual wallet manager increment function
        const result = await walletManager.incrementCounter(APP_CONFIG.contractId);

        if (result.success) {
          return {
            success: true,
            transactionId: result.transactionId || `tx_${Date.now()}`,
            data: result.data
          };
        } else {
          throw new Error(result.error || 'Transaction failed');
        }
      },
      'Counter incremented successfully'
    );
  }, [contract, wallet, walletManager]);

  // Decrement counter
  const decrement = useCallback(async () => {
    console.log('decrement called', { contract: !!contract, wallet: !!wallet });

    if (!contract) {
      console.log('No contract available');
      return;
    }

    if (!wallet?.isConnected) {
      setError('Please connect your wallet to perform transactions');
      return;
    }

    if (contract.count <= contract.minCount) {
      setError(ERROR_MESSAGES.MIN_COUNT_EXCEEDED);
      return;
    }

    return await executeContractFunction(
      'decrement',
      async () => {
        console.log('Executing real decrement transaction...');
        // Call the actual wallet manager decrement function
        const result = await walletManager.decrementCounter(APP_CONFIG.contractId);

        if (result.success) {
          return {
            success: true,
            transactionId: result.transactionId || `tx_${Date.now()}`,
            data: result.data
          };
        } else {
          throw new Error(result.error || 'Transaction failed');
        }
      },
      'Counter decremented successfully'
    );
  }, [contract, wallet, walletManager]);

  // Increment counter by amount
  const incrementBy = useCallback(async (amount: number) => {
    console.log('incrementBy called', { amount, contract: !!contract, wallet: !!wallet });

    if (!contract) {
      console.log('No contract available');
      return;
    }

    if (!wallet?.isConnected) {
      setError('Please connect your wallet to perform transactions');
      return;
    }

    // Validation
    if (amount < VALIDATION.MIN_INCREMENT_AMOUNT || amount > VALIDATION.MAX_INCREMENT_AMOUNT) {
      setError(`Amount must be between ${VALIDATION.MIN_INCREMENT_AMOUNT} and ${VALIDATION.MAX_INCREMENT_AMOUNT}`);
      return;
    }

    if (contract.count + amount > contract.maxCount) {
      setError(ERROR_MESSAGES.MAX_COUNT_EXCEEDED);
      return;
    }

    return await executeContractFunction(
      'incrementBy',
      async () => {
        console.log(`Executing real incrementBy ${amount} transaction...`);
        // Call the actual wallet manager incrementBy function
        const result = await walletManager.incrementCounterBy(APP_CONFIG.contractId, amount);

        if (result.success) {
          return {
            success: true,
            transactionId: result.transactionId || `tx_${Date.now()}`,
            amount,
            data: result.data
          };
        } else {
          throw new Error(result.error || 'Transaction failed');
        }
      },
      `Counter incremented by ${amount} successfully`
    );
  }, [contract, wallet, walletManager]);

  // Decrement counter by amount
  const decrementBy = useCallback(async (amount: number) => {
    console.log('decrementBy called', { amount, contract: !!contract, wallet: !!wallet });

    if (!contract) {
      console.log('No contract available');
      return;
    }

    if (!wallet?.isConnected) {
      setError('Please connect your wallet to perform transactions');
      return;
    }

    // Validation
    if (amount < VALIDATION.MIN_DECREMENT_AMOUNT || amount > VALIDATION.MAX_DECREMENT_AMOUNT) {
      setError(`Amount must be between ${VALIDATION.MIN_DECREMENT_AMOUNT} and ${VALIDATION.MAX_DECREMENT_AMOUNT}`);
      return;
    }

    if (contract.count - amount < contract.minCount) {
      setError(ERROR_MESSAGES.MIN_COUNT_EXCEEDED);
      return;
    }

    return await executeContractFunction(
      'decrementBy',
      async () => {
        console.log(`Executing real decrementBy ${amount} transaction...`);
        // Call the actual wallet manager decrementBy function
        const result = await walletManager.decrementCounterBy(APP_CONFIG.contractId, amount);

        if (result.success) {
          return {
            success: true,
            transactionId: result.transactionId || `tx_${Date.now()}`,
            amount,
            data: result.data
          };
        } else {
          throw new Error(result.error || 'Transaction failed');
        }
      },
      `Counter decremented by ${amount} successfully`
    );
  }, [contract, wallet, walletManager]);

  // Reset counter (owner only)
  const reset = useCallback(async () => {
    if (!contract || !wallet) return;

    // Check if user is the owner
    const userAddress = `0x${wallet.accountId.replace(/\./g, '')}`;
    if (contract.owner.toLowerCase() !== userAddress.toLowerCase()) {
      setError('Only the contract owner can reset the counter');
      return;
    }

    return await executeContractFunction(
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
    clearError,
    isLoading,
    error,
  };
};
