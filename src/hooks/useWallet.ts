import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// opBNB Testnet configuration
const OPBNB_TESTNET = {
  chainId: '0x15EB', // 5611 in hex
  chainName: 'opBNB Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://opbnb-testnet-rpc.bnbchain.org'],
  blockExplorerUrls: ['https://opbnb-testnet.bscscan.com'],
};

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setUserAddress(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    const isOpBNB = chainId === OPBNB_TESTNET.chainId;
    setIsCorrectNetwork(isOpBNB);
    
    if (!isOpBNB) {
      toast({
        title: "Wrong Network",
        description: "Please switch to opBNB Testnet to use this application.",
        variant: "destructive",
      });
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const isOpBNB = network.chainId.toString() === '5611'; // opBNB testnet chain ID
          
          setProvider(provider);
          setUserAddress(accounts[0].address);
          setIsConnected(true);
          setIsCorrectNetwork(isOpBNB);
          
          if (isOpBNB) {
            const signer = await provider.getSigner();
            setSigner(signer);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const addOpBNBNetwork = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [OPBNB_TESTNET],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        throw new Error('Failed to add opBNB Testnet to MetaMask');
      }
      throw error;
    }
  };

  const switchToOpBNB = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: OPBNB_TESTNET.chainId }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask, add it first
        await addOpBNBNetwork();
        return true;
      }
      throw error;
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        
        // Check if we're on the correct network
        const network = await provider.getNetwork();
        const isOpBNB = network.chainId.toString() === '5611';
        
        if (!isOpBNB) {
          toast({
            title: "Switching to opBNB Testnet",
            description: "Adding and switching to opBNB Testnet...",
          });
          
          try {
            await switchToOpBNB();
            // Refresh provider after network switch
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            const signer = await newProvider.getSigner();
            const address = await signer.getAddress();

            setProvider(newProvider);
            setSigner(signer);
            setUserAddress(address);
            setIsConnected(true);
            setIsCorrectNetwork(true);

            toast({
              title: "Wallet Connected",
              description: `Connected to opBNB Testnet: ${address.slice(0, 6)}...${address.slice(-4)}`,
            });
          } catch (networkError) {
            toast({
              title: "Network Switch Failed",
              description: "Failed to switch to opBNB Testnet. Please switch manually in MetaMask.",
              variant: "destructive",
            });
            return;
          }
        } else {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          setProvider(provider);
          setSigner(signer);
          setUserAddress(address);
          setIsConnected(true);
          setIsCorrectNetwork(true);

          toast({
            title: "Wallet Connected",
            description: `Connected to opBNB Testnet: ${address.slice(0, 6)}...${address.slice(-4)}`,
          });
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this application.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return {
    isConnected,
    userAddress,
    provider,
    signer,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToOpBNB,
  };
};