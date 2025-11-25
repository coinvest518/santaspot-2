import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FaEthereum, FaWallet } from 'react-icons/fa';
import { SiPolygon } from 'react-icons/si';
import { RiExchangeLine } from 'react-icons/ri';
import { useToast } from "@/hooks/use-toast";
import { recordDonation } from '../lib/firebase';
import TOKENS, { TokenInfo } from '@/config/tokens';
import RECEIVERS from '@/config/receivers';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

interface PaymentOption {
  amount: string;
  label: string;
  description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    amount: "0.01",
    label: "Basic Support",
    description: "Small contribution to support the project"
  },
  {
    amount: "0.05",
    label: "Standard Support",
    description: "Help us grow and develop new features"
  },
  {
    amount: "0.1",
    label: "Premium Support",
    description: "Become a premium supporter with special benefits"
  }
];

const RECEIVER_WALLET = import.meta.env.REACT_APP_WALLET_ADDRESS || "YOUR_WALLET_ADDRESS_HERE"; // Fallback for development

// Network configurations
const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [`https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`],
    blockExplorerUrls: ['https://etherscan.io']
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [`https://polygon-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`],
    blockExplorerUrls: ['https://polygonscan.com/']
  },
  base: {
    chainId: '0x2105',
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [`https://base-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`],
    blockExplorerUrls: ['https://basescan.org']
  },
  bnb: {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  mumbai: {
    chainId: '0x13881',
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [`https://polygon-mumbai.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  },
};

const CryptoPaymentPage = () => {
  const { toast } = useToast();
  const { userProfile } = useFirebaseUser();
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [gasEstimate, setGasEstimate] = useState<{
    gasLimit: string;
    gasPriceGwei: string;
    totalCost: string;
    networkFee: string;
  } | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isDisconnected, setIsDisconnected] = useState(false);

  const getReceiver = (networkName: string) => {
    return (RECEIVERS as Record<string, string>)[networkName] || RECEIVER_WALLET;
  };

  useEffect(() => {
    if (!isDisconnected) {
      checkIfWalletIsConnected();
    }
  }, [selectedNetwork, isDisconnected]);

  // fetch selected token balance
  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        const { ethereum } = window as any;
        if (!ethereum || !account || !selectedToken) return;
        const provider = new ethers.providers.Web3Provider(ethereum);
        if (selectedToken.isNative) {
          const bal = await provider.getBalance(account);
          setTokenBalance(ethers.utils.formatUnits(bal, 18));
        } else if (selectedToken.address) {
          const erc20Abi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];
          const tokenContract = new ethers.Contract(selectedToken.address, erc20Abi, provider);
          const bal = await tokenContract.balanceOf(account);
          setTokenBalance(ethers.utils.formatUnits(bal, selectedToken.decimals));
        }
      } catch (err) {
        console.error('Error fetching token balance', err);
      }
    };
    fetchTokenBalance();
  }, [account, selectedToken]);

  useEffect(() => {
    // default selected token for network
    const list = TOKENS[selectedNetwork] || [];
    setSelectedToken(list[0] || null);
  }, [selectedNetwork]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        toast({
          title: "MetaMask not detected",
          description: "Please install MetaMask browser extension",
          variant: "destructive",
        });
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setIsDisconnected(false);
      const { ethereum } = window as any;
      if (!ethereum) {
        toast({
          title: "MetaMask not detected",
          description: "Please install MetaMask browser extension",
          variant: "destructive",
        });
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(balance));
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected.",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsDisconnected(true);
    setAccount('');
    setBalance('0');
    setTokenBalance('0');
    setSelectedToken(null);
    setGasEstimate(null);
    setSelectedAmount('');
    setCustomAmount('');
    setIsProcessing(false);
    setIsConnecting(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected. You can reconnect anytime.",
    });
  };

  const switchNetwork = async (networkName: string) => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) return;

      const network = NETWORKS[networkName];
      setIsProcessing(true);

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });
        setSelectedNetwork(networkName);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
          setSelectedNetwork(networkName);
        }
      }
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const estimateGasForTransaction = async (amount: string) => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const amountInWei = ethers.utils.parseEther(amount);

      const gasPrice = await provider.getGasPrice();
      let gasLimit;
      // If ERC20 token selected, estimate gas against token contract transfer
      if (selectedToken && !selectedToken.isNative && selectedToken.address) {
        const erc20Abi = [
          'function transfer(address to, uint256 amount) returns (bool)'
        ];
        const contract = new ethers.Contract(selectedToken.address, erc20Abi, provider);
        const data = contract.interface.encodeFunctionData('transfer', [getReceiver(selectedNetwork), amountInWei]);
        gasLimit = await provider.estimateGas({ to: selectedToken.address, data, from: account });
      } else {
        gasLimit = await provider.estimateGas({
          to: RECEIVER_WALLET,
          value: amountInWei,
          from: account
        });
      }

      const networkFee = gasPrice.mul(gasLimit);
      const totalCost = amountInWei.add(networkFee);

      setGasEstimate({
        gasLimit: gasLimit.toString(),
        gasPriceGwei: ethers.utils.formatUnits(gasPrice, 'gwei'),
        totalCost: ethers.utils.formatEther(totalCost),
        networkFee: ethers.utils.formatEther(networkFee)
      });
    } catch (error: any) {
      toast({
        title: "Gas Estimation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (amount: string) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      setIsProcessing(true);
      const { ethereum } = window as any;
      if (!ethereum) throw new Error('Wallet not available');

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      // Parse amount according to token decimals
      let amountInUnits;
      let currencySymbol = selectedToken?.symbol || (selectedNetwork === 'polygon' ? 'MATIC' : 'ETH');

      if (selectedToken && !selectedToken.isNative) {
        // ERC-20: convert based on token decimals
        amountInUnits = ethers.utils.parseUnits(amount, selectedToken.decimals);
      } else {
        amountInUnits = ethers.utils.parseEther(amount);
      }

      // Check native balance to ensure gas coverage
      const nativeBal = await provider.getBalance(account);
      const minGasCheck = ethers.utils.parseEther('0.001'); // lightweight check
      if (nativeBal.lt(minGasCheck)) {
        throw new Error('Insufficient native balance to pay gas (need small amount of MATIC/ETH)');
      }

      // Execute correct flow
      let tx;
      if (selectedToken && !selectedToken.isNative && selectedToken.address) {
        // ERC-20 direct transfer
        const erc20Abi = [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function balanceOf(address) view returns (uint256)'
        ];
        const tokenContract = new ethers.Contract(selectedToken.address, erc20Abi, signer);
        // estimate gas for token transfer (optional)
        try {
            const gasEst = await tokenContract.estimateGas.transfer(getReceiver(selectedNetwork), amountInUnits);
          // send
          tx = await tokenContract.transfer(getReceiver(selectedNetwork), amountInUnits, { gasLimit: gasEst.mul(110).div(100) });
        } catch (err) {
          // fallback send without manual gas
          tx = await tokenContract.transfer(getReceiver(selectedNetwork), amountInUnits);
        }
      } else {
        // Native transfer
        const amountInWei = amountInUnits;
        await estimateGasForTransaction(amount);
        if (!gasEstimate) throw new Error('Failed to estimate gas');
        tx = await signer.sendTransaction({ to: getReceiver(selectedNetwork), value: amountInWei, gasLimit: gasEstimate.gasLimit });
      }

      toast({ title: 'Transaction Sent', description: 'Please wait for confirmation...' });
      await tx.wait();

      if (userProfile?.uuid) {
        await recordDonation(userProfile.uuid, parseFloat(amount), currencySymbol, selectedNetwork, tx.hash);
      }

      toast({ title: 'Payment Successful!', description: `Successfully sent ${amount} ${currencySymbol}` });
      setSelectedAmount('');
      setCustomAmount('');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Payment Failed",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Crypto Payments</h1>
          <p className="text-gray-400 text-xl">
            Support our project with cryptocurrency
          </p>
        </div>

        {/* Network Selection */}
        <div className="flex justify-center mb-8 space-x-4 flex-wrap">
          {Object.keys(NETWORKS).map((networkKey) => {
            const network = NETWORKS[networkKey];
            return (
              <button
                key={networkKey}
                onClick={() => switchNetwork(networkKey)}
                disabled={isProcessing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedNetwork === networkKey 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <span>{network.chainName}</span>
              </button>
            );
          })}
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-12">
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaWallet className="text-xl" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="flex items-center space-x-4 bg-gray-800 px-6 py-4 rounded-xl shadow-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <FaWallet className="text-white text-lg" />
              </div>
              <div className="text-left">
                <div className="text-green-400 font-semibold">Connected</div>
                <div className="text-gray-300 text-sm">
                  {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                </div>
                <div className="text-gray-400 text-xs mt-1">Click to disconnect</div>
              </div>
            </button>
          )}
        </div>

        {/* Wallet Status */}
        {account && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">Wallet Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Network:</span>
                <span className="font-medium">{NETWORKS[selectedNetwork]?.chainName || selectedNetwork}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Address:</span>
                <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                  {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Native Balance:</span>
                <span className="font-medium">{parseFloat(balance).toFixed(4)} {NETWORKS[selectedNetwork]?.nativeCurrency.symbol}</span>
              </div>
              {selectedToken && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{selectedToken.symbol} Balance:</span>
                  <span className="font-medium">{parseFloat(tokenBalance || '0').toFixed(6)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Token selection dropdown */}
        {account && (
          <div className="flex justify-center mb-6">
            <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Token</label>
              <select
                value={selectedToken?.symbol}
                onChange={(e) => {
                  const list = TOKENS[selectedNetwork] || [];
                  const token = list.find(t => t.symbol === e.target.value) || null;
                  setSelectedToken(token);
                }}
                className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                {(TOKENS[selectedNetwork] || []).map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.symbol} {t.isNative ? '(Native)' : ''} - {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Payment Options */}
        {account && selectedToken && (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {PAYMENT_OPTIONS.map((option, index) => (
              <div
                key={index}
                className={`bg-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:transform hover:scale-105 border-2 shadow-lg ${
                  selectedAmount === option.amount
                    ? 'border-blue-500 bg-gray-700'
                    : 'border-transparent hover:border-gray-600'
                }`}
                onClick={() => setSelectedAmount(option.amount)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{selectedToken.symbol.charAt(0)}</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {option.amount} {selectedToken.symbol}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{option.label}</h3>
                <p className="text-gray-400">{option.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Gas Estimation Display */}
        {gasEstimate && selectedToken && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8 max-w-md mx-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">Transaction Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Price:</span>
                <span className="font-medium">{parseFloat(gasEstimate.gasPriceGwei).toFixed(2)} Gwei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Gas Limit:</span>
                <span className="font-medium">{gasEstimate.gasLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee:</span>
                <span className="font-medium">{parseFloat(gasEstimate.networkFee).toFixed(6)} {NETWORKS[selectedNetwork]?.nativeCurrency.symbol}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-700 pt-3 mt-3">
                <span>Total Cost:</span>
                <span>{parseFloat(gasEstimate.totalCost).toFixed(6)} {NETWORKS[selectedNetwork]?.nativeCurrency.symbol}</span>
              </div>
              <div className="text-sm text-gray-400 text-center mt-2">
                Gas is paid in {NETWORKS[selectedNetwork]?.nativeCurrency.symbol} even for {selectedToken.symbol} transfers
              </div>
            </div>
          </div>
        )}

        {/* Custom Amount */}
        {account && selectedToken && (
          <div className="max-w-md mx-auto bg-gray-800 rounded-xl p-6 mb-12 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Custom Amount</h3>
            <div className="flex space-x-4">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`Enter ${selectedToken.symbol} amount`}
                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handlePayment(customAmount)}
                disabled={!customAmount || isProcessing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                         px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                {isProcessing ? 'Processing...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Selected Amount Payment Button */}
        {account && selectedAmount && selectedToken && (
          <div className="text-center">
            <button
              onClick={() => handlePayment(selectedAmount)}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 
                       px-8 py-4 rounded-xl font-semibold text-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <span className="flex items-center space-x-2">
                  <RiExchangeLine className="text-2xl" />
                  <span>{`Pay ${selectedAmount} ${selectedToken.symbol}`}</span>
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPaymentPage;