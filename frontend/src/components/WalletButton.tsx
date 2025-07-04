/**
 * Wallet connection button component
 */

import React from 'react';
import { Wallet, LogOut, AlertCircle, Download } from 'lucide-react';
import { WalletButtonProps } from '@/types';
import { getWalletManager, isWalletAvailable, getWalletInstallInstructions } from '@/utils/wallet';
import { truncateAddress } from '@/utils/config';

export const WalletButton: React.FC<WalletButtonProps> = ({
  onConnect,
  onDisconnect,
  wallet,
  isConnecting = false,
}) => {
  const walletManager = getWalletManager();
  const availableWallets = walletManager.getAvailableWallets();
  const hasWalletInstalled = isWalletAvailable();

  // If no wallet is installed, show install instructions
  if (!hasWalletInstalled) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-warning-500" />
          <h3 className="text-lg font-semibold">Wallet Required</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          You need a Hedera wallet to interact with this dApp. We recommend HashPack.
        </p>
        
        <div className="space-y-3">
          {Object.entries(getWalletInstallInstructions()).map(([key, wallet]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{wallet.name}</h4>
                <a
                  href={wallet.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </a>
              </div>
              <p className="text-sm text-gray-600 mb-3">{wallet.description}</p>
              <ol className="text-sm text-gray-600 space-y-1">
                {wallet.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-xs font-medium flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If wallet is connected, show wallet info and disconnect button
  if (wallet) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Wallet Connected</p>
              <p className="text-sm text-gray-600">
                {truncateAddress(wallet.accountId)} • {wallet.network}
              </p>
            </div>
          </div>
          
          <button
            onClick={onDisconnect}
            className="btn btn-secondary"
            title="Disconnect Wallet"
          >
            <LogOut className="w-4 h-4 mr-2" />
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

  // Show connect button with available wallets
  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600">
          Connect your Hedera wallet to interact with the counter contract
        </p>
      </div>

      <div className="space-y-3">
        {availableWallets.map((walletOption) => (
          <button
            key={walletOption.id}
            onClick={() => onConnect(walletOption.id)}
            disabled={isConnecting || !walletOption.isInstalled}
            className="w-full btn btn-primary flex items-center justify-center space-x-3 py-3"
          >
            {isConnecting ? (
              <>
                <div className="loading-spinner w-5 h-5" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <img
                  src={walletOption.icon}
                  alt={walletOption.name}
                  className="w-6 h-6"
                  onError={(e) => {
                    // Fallback to wallet icon if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Wallet className="w-5 h-5" />
                <span>Connect {walletOption.name}</span>
              </>
            )}
          </button>
        ))}
      </div>

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
    </div>
  );
};
