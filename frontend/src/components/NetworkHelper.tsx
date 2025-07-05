/**
 * Network configuration helper component for MetaMask
 */

import React, { useState, useEffect } from 'react';
import { Settings, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { HederaNetwork } from '@/types';
import { HEDERA_NETWORKS } from '@/utils/metamask';

interface NetworkHelperProps {
  currentNetwork?: Exclude<HederaNetwork, 'previewnet'>;
  onNetworkAdded?: (network: Exclude<HederaNetwork, 'previewnet'>) => void;
}

export const NetworkHelper: React.FC<NetworkHelperProps> = ({
  currentNetwork = 'testnet',
  onNetworkAdded
}) => {
  const [isAdding, setIsAdding] = useState<Exclude<HederaNetwork, 'previewnet'> | null>(null);
  const [addedNetworks, setAddedNetworks] = useState<Set<Exclude<HederaNetwork, 'previewnet'>>>(new Set());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Client-safe icon component
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

  const addNetworkToMetaMask = async (network: Exclude<HederaNetwork, 'previewnet'>) => {
    if (!window.ethereum) {
      alert('MetaMask is not installed');
      return;
    }

    setIsAdding(network);

    try {
      const networkConfig = HEDERA_NETWORKS[network];
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });

      setAddedNetworks(prev => new Set(prev).add(network));
      onNetworkAdded?.(network);
      
      console.log(`Hedera ${network} network added to MetaMask successfully`);
    } catch (error: any) {
      console.error(`Failed to add Hedera ${network} to MetaMask:`, error);
      
      if (error.code === 4001) {
        // User rejected the request
        alert('Network addition was cancelled by user');
      } else {
        alert(`Failed to add Hedera ${network} to MetaMask. Please try again.`);
      }
    } finally {
      setIsAdding(null);
    }
  };

  const switchToNetwork = async (network: Exclude<HederaNetwork, 'previewnet'>) => {
    if (!window.ethereum) {
      alert('MetaMask is not installed');
      return;
    }

    try {
      const networkConfig = HEDERA_NETWORKS[network];
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      
      console.log(`Switched to Hedera ${network} network`);
    } catch (error: any) {
      console.error(`Failed to switch to Hedera ${network}:`, error);
      
      if (error.code === 4902) {
        // Network not added yet, try to add it
        await addNetworkToMetaMask(network);
      } else if (error.code === 4001) {
        // User rejected the request
        alert('Network switch was cancelled by user');
      } else {
        alert(`Failed to switch to Hedera ${network}. Please try again.`);
      }
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <ClientSafeIcon icon={Settings} className="w-5 h-5 text-blue-600" fallback="⚙" />
        <h3 className="font-medium text-blue-900">MetaMask Network Setup</h3>
      </div>
      
      <p className="text-sm text-blue-800 mb-4">
        Add Hedera networks to your MetaMask wallet for seamless interaction with Hedera dApps.
      </p>

      <div className="space-y-3">
        {Object.entries(HEDERA_NETWORKS).map(([networkKey, networkConfig]) => {
          const network = networkKey as Exclude<HederaNetwork, 'previewnet'>;
          const isAdded = addedNetworks.has(network);
          const isCurrentlyAdding = isAdding === network;
          const isCurrent = currentNetwork === network;

          return (
            <div
              key={network}
              className="flex items-center justify-between p-3 bg-white rounded border"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {isAdded ? (
                    <ClientSafeIcon icon={CheckCircle} className="w-4 h-4 text-green-500" fallback="✓" />
                  ) : (
                    <ClientSafeIcon icon={AlertCircle} className="w-4 h-4 text-gray-400" fallback="○" />
                  )}
                  <span className="font-medium capitalize">{network}</span>
                  {isCurrent && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <div>Chain ID: {parseInt(networkConfig.chainId, 16)}</div>
                  <div>RPC: {networkConfig.rpcUrls[0]}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isAdded ? (
                  <button
                    onClick={() => addNetworkToMetaMask(network)}
                    disabled={isCurrentlyAdding}
                    className="btn btn-sm btn-primary flex items-center space-x-1"
                  >
                    {isCurrentlyAdding ? (
                      <>
                        <div className="loading-spinner w-3 h-3" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ClientSafeIcon icon={Plus} className="w-3 h-3" fallback="+" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => switchToNetwork(network)}
                    className="btn btn-sm btn-secondary"
                  >
                    Switch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> After adding a network, you may need to refresh the page and reconnect your wallet.
        </p>
      </div>
    </div>
  );
};

// Utility component for quick network addition
export const QuickNetworkAdd: React.FC<{ network: Exclude<HederaNetwork, 'previewnet'> }> = ({ network }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Client-safe icon component
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

  const addNetwork = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed');
      return;
    }

    setIsAdding(true);

    try {
      const networkConfig = HEDERA_NETWORKS[network];
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
      
      console.log(`Hedera ${network} network added successfully`);
    } catch (error: any) {
      console.error(`Failed to add Hedera ${network}:`, error);
      
      if (error.code !== 4001) { // Don't show error for user rejection
        alert(`Failed to add Hedera ${network} to MetaMask`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={addNetwork}
      disabled={isAdding}
      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 underline"
    >
      {isAdding ? (
        <>
          <div className="loading-spinner w-3 h-3" />
          <span>Adding {network}...</span>
        </>
      ) : (
        <>
          <ClientSafeIcon icon={Plus} className="w-3 h-3" fallback="+" />
          <span>Add Hedera {network} to MetaMask</span>
        </>
      )}
    </button>
  );
};
