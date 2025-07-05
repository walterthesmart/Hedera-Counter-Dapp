/**
 * React hook for wallet management
 */

import { useState, useEffect, useCallback } from 'react';
import { WalletConnection, UseWalletReturn, WalletType } from '@/types';
import {
  hashPackWallet,
  connectHashPack,
  disconnectHashPack,
  getHashPackConnection
} from '@/utils/hashpack';
import {
  connectMetaMask,
  disconnectMetaMask,
  getMetaMaskConnection,
  isMetaMaskInstalled,
  refreshMetaMaskBalance
} from '@/utils/metamask';
import { SUCCESS_MESSAGES } from '@/utils/config';

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved wallet connection on mount
  useEffect(() => {
    console.log('🔍 useWallet: Loading saved connections...');

    // Check for saved HashPack connection
    const savedHashPack = getHashPackConnection();
    console.log('🔍 useWallet: HashPack connection:', savedHashPack);
    if (savedHashPack && savedHashPack.isConnected) {
      console.log('🔍 useWallet: Setting HashPack wallet with balance:', savedHashPack.balance);
      setWallet(savedHashPack);
      return;
    }

    // Check for saved MetaMask connection
    const savedMetaMask = getMetaMaskConnection();
    console.log('🔍 useWallet: MetaMask connection:', savedMetaMask);
    if (savedMetaMask && savedMetaMask.isConnected) {
      console.log('🔍 useWallet: Setting MetaMask wallet with balance:', savedMetaMask.balance);
      setWallet(savedMetaMask);

      // Refresh balance in the background
      if (savedMetaMask.walletType === 'metamask') {
        refreshMetaMaskBalance().then(() => {
          console.log('🔍 useWallet: Balance refreshed, getting updated connection');
          const updatedConnection = getMetaMaskConnection();
          if (updatedConnection) {
            console.log('🔍 useWallet: Updated connection with balance:', updatedConnection.balance);
            setWallet(updatedConnection);
          }
        }).catch(error => {
          console.error('🔍 useWallet: Failed to refresh balance:', error);
        });
      }
      return;
    }

    console.log('🔍 useWallet: No saved connections found');
  }, []);

  // Check if HashPack is available
  const isHashPackAvailable = useCallback(() => {
    return hashPackWallet.isAvailable();
  }, []);

  // Check if MetaMask is available
  const isMetaMaskAvailable = useCallback(() => {
    return isMetaMaskInstalled();
  }, []);

  // Connect to wallet (HashPack, MetaMask, or WalletConnect)
  const connect = useCallback(async (walletType: WalletType = 'hashpack') => {
    setIsConnecting(true);
    setError(null);

    try {
      let connection: WalletConnection;

      switch (walletType) {
        case 'metamask':
          if (!isMetaMaskAvailable()) {
            throw new Error('MetaMask is not installed. Please install the MetaMask browser extension.');
          }
          connection = await connectMetaMask();
          break;

        case 'hashpack':
        default:
          if (!isHashPackAvailable()) {
            throw new Error('HashPack wallet is not installed. Please install the HashPack browser extension.');
          }
          connection = await connectHashPack();
          break;
      }

      console.log('🔍 useWallet: Connection established:', connection);
      console.log('🔍 useWallet: Connection balance:', connection.balance);
      setWallet(connection);
      console.log(SUCCESS_MESSAGES.WALLET_CONNECTED);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to connect to ${walletType} wallet`;
      setError(errorMessage);
      console.error(`${walletType} connection failed:`, error);
    } finally {
      setIsConnecting(false);
    }
  }, [isHashPackAvailable, isMetaMaskAvailable]);

  // Disconnect from current wallet
  const disconnect = useCallback(async () => {
    try {
      if (wallet?.walletType === 'metamask') {
        await disconnectMetaMask();
      } else {
        await disconnectHashPack();
      }
      setWallet(null);
      setError(null);

      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
      // Even if disconnect fails, clear the local state
      setWallet(null);
    }
  }, [wallet?.walletType]);

  return {
    wallet,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!wallet?.isConnected,
    isHashPackAvailable: isHashPackAvailable(),
    isMetaMaskAvailable: isMetaMaskAvailable(),
  };
};
