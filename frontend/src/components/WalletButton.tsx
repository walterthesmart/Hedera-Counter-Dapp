/**
 * Wallet connection button component
 */

import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, AlertCircle, Download, ChevronDown, Settings } from 'lucide-react';
import { WalletButtonProps, WalletType } from '@/types';
import { hashPackWallet } from '@/utils/hashpack';
import { isMetaMaskInstalled } from '@/utils/metamask';
import { truncateAddress } from '@/utils/config';
import { NetworkHelper } from './NetworkHelper';

export const WalletButton: React.FC<WalletButtonProps> = ({
  onConnect,
  onDisconnect,
  wallet,
  isConnecting = false,
}) => {
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showNetworkHelper, setShowNetworkHelper] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [walletAvailability, setWalletAvailability] = useState({
    hashpack: false,
    metamask: false,
  });

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    setWalletAvailability({
      hashpack: hashPackWallet.isAvailable(),
      metamask: isMetaMaskInstalled(),
    });
  }, []);

  // Client-safe icon component to prevent hydration issues
  const ClientSafeIcon: React.FC<{
    icon: React.ComponentType<any>;
    className?: string;
    fallback?: string;
  }> = ({ icon: Icon, className, fallback = "○" }) => {
    if (!isClient) {
      return <span className={className}>{fallback}</span>;
    }
    return <Icon className={className} />;
  };

  // Show HashPack installation help if needed
  const showHashPackHelp = () => {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <ClientSafeIcon icon={AlertCircle} className="w-6 h-6 text-warning-500" fallback="⚠" />
          <h3 className="text-lg font-semibold">HashPack Wallet Required</h3>
        </div>

        <p className="text-gray-600 mb-4">
          To interact with this Hedera smart contract, you need the HashPack wallet extension.
        </p>

        <div className="space-y-3">
          <a
            href="https://www.hashpack.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            <ClientSafeIcon icon={Download} className="w-4 h-4" fallback="↓" />
            <span>Install HashPack Wallet</span>
          </a>

          <div className="text-sm text-gray-500">
            <p>After installation:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Create or import your Hedera account</li>
              <li>Make sure you're on the Hedera Testnet</li>
              <li>Refresh this page and click "Connect HashPack"</li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  // If wallet is connected, show wallet info and disconnect button
  if (wallet) {
    const walletIcon = wallet.walletType === 'metamask' ? '🦊' : '🔷';
    const walletName = wallet.walletType === 'metamask' ? 'MetaMask' : 'HashPack';

    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
              <span className="text-lg">{walletIcon}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{walletName} Connected</p>
              <p className="text-sm text-gray-600">
                {truncateAddress(wallet.accountId)} • {wallet.network}
              </p>
              {wallet.address && (
                <p className="text-xs text-gray-500">
                  {truncateAddress(wallet.address)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onDisconnect}
            className="btn btn-secondary"
            title="Disconnect Wallet"
          >
            <ClientSafeIcon icon={LogOut} className="w-4 h-4 mr-2" fallback="→" />
            Disconnect
          </button>
        </div>

        {wallet.balance && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Balance: <span className="font-medium">{wallet.balance}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Wallet connection options (only available on client-side)
  const walletOptions = [
    {
      id: 'hashpack' as WalletType,
      name: 'HashPack',
      icon: '🔷',
      available: isClient ? walletAvailability.hashpack : false,
      downloadUrl: 'https://www.hashpack.app/',
      description: 'Official Hedera wallet with WalletConnect support'
    },
    {
      id: 'metamask' as WalletType,
      name: 'MetaMask',
      icon: '🦊',
      available: isClient ? walletAvailability.metamask : false,
      downloadUrl: 'https://metamask.io/',
      description: 'Popular Ethereum wallet with Hedera network support'
    }
  ];

  // Show connect button for wallet selection
  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClientSafeIcon icon={Wallet} className="w-8 h-8 text-primary-600" fallback="💼" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600">
          Choose a wallet to interact with the Hedera counter contract
        </p>
      </div>

      <div className="space-y-4">
        {walletOptions.map((walletOption) => (
          <div key={walletOption.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{walletOption.icon}</span>
                <div>
                  <h4 className="font-medium">{walletOption.name}</h4>
                  <p className="text-sm text-gray-600">{walletOption.description}</p>
                </div>
              </div>
              {!walletOption.available && isClient && (
                <ClientSafeIcon icon={AlertCircle} className="w-5 h-5 text-yellow-500" fallback="⚠" />
              )}
            </div>

            {walletOption.available ? (
              <button
                onClick={() => onConnect(walletOption.id)}
                disabled={isConnecting}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <div className="loading-spinner w-4 h-4" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <ClientSafeIcon icon={Wallet} className="w-4 h-4" fallback="💼" />
                    <span>Connect {walletOption.name}</span>
                  </>
                )}
              </button>
            ) : (
              <a
                href={walletOption.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn btn-secondary flex items-center justify-center space-x-2"
              >
                <ClientSafeIcon icon={Download} className="w-4 h-4" fallback="↓" />
                <span>Install {walletOption.name}</span>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* MetaMask Network Configuration */}
      {isClient && walletAvailability.metamask && (
        <div className="mt-4">
          <button
            onClick={() => setShowNetworkHelper(!showNetworkHelper)}
            className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-800 py-2"
          >
            <ClientSafeIcon icon={Settings} className="w-4 h-4" fallback="⚙" />
            <span>Configure Hedera Networks in MetaMask</span>
            <ClientSafeIcon
              icon={ChevronDown}
              className={`w-4 h-4 transition-transform ${showNetworkHelper ? 'rotate-180' : ''}`}
              fallback={showNetworkHelper ? "▲" : "▼"}
            />
          </button>

          {showNetworkHelper && (
            <div className="mt-3">
              <NetworkHelper currentNetwork="testnet" />
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>New to Hedera?</strong> Get testnet HBAR from the{' '}
          <a
            href="https://portal.hedera.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Hedera Portal
          </a>{' '}
          to start testing.
        </p>
      </div>

      <details className="mt-4">
        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
          Need help installing a wallet?
        </summary>
        <div className="mt-3">
          {showHashPackHelp()}
        </div>
      </details>
    </div>
  );
};
