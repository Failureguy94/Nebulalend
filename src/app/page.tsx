"use client";

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  AlertTriangle,
  Plus,
  Minus,
  DollarSign,
  Clock,
  Users,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  LucideIcon,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Settings,
  LogOut
} from 'lucide-react';

// Type definitions
interface TabButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  color?: string;
}

interface OrderBookEntry {
  rate: number;
  amount: number;
  type: 'lend' | 'borrow';
}

interface OrderBookRowProps {
  order: OrderBookEntry;
}

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  ltv: number;
  balance?: number;
}

interface UserStats {
  totalCollateral: number;
  totalBorrowed: number;
  availableCredit: number;
  creditScore: number;
  healthFactor: number;
  liquidationThreshold: number;
}

interface MarketData {
  totalValueLocked: number;
  totalBorrowed: number;
  activeLoans: number;
  averageAPR: number;
}

interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  walletType: string;
}

interface ZkProof {
  id: string;
  type: 'credit' | 'collateral';
  status: 'pending' | 'verified' | 'failed';
  description: string;
  timestamp: number;
}

const NebulaLendPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPrivateData, setShowPrivateData] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [zkProofs, setZkProofs] = useState<ZkProof[]>([]);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);

  // Mock data with proper typing
  const [userStats, setUserStats] = useState<UserStats>({
    totalCollateral: 0,
    totalBorrowed: 0,
    availableCredit: 0,
    creditScore: 0,
    healthFactor: 0,
    liquidationThreshold: 0.85
  });

  const [marketData, setMarketData] = useState<MarketData>({
    totalValueLocked: 125000000,
    totalBorrowed: 78000000,
    activeLoans: 2847,
    averageAPR: 4.2
  });

  const [orderBook, setOrderBook] = useState<OrderBookEntry[]>([
    { rate: 3.2, amount: 50000, type: 'lend' },
    { rate: 3.5, amount: 25000, type: 'lend' },
    { rate: 3.8, amount: 15000, type: 'lend' },
    { rate: 4.1, amount: 30000, type: 'borrow' },
    { rate: 4.3, amount: 20000, type: 'borrow' },
    { rate: 4.5, amount: 40000, type: 'borrow' }
  ]);

  const assets: Asset[] = [
    { symbol: 'ETH', name: 'Ethereum', price: 2340, change: 2.5, ltv: 0.8, balance: 0 },
    { symbol: 'BTC', name: 'Bitcoin', price: 43200, change: -1.2, ltv: 0.75, balance: 0 },
    { symbol: 'USDC', name: 'USD Coin', price: 1.0, change: 0.0, ltv: 0.9, balance: 0 },
    { symbol: 'LINK', name: 'Chainlink', price: 14.8, change: 5.2, ltv: 0.7, balance: 0 }
  ];

  const supportedWallets = [
    { name: 'MetaMask', icon: '🦊', id: 'metamask' },
    { name: 'Phantom', icon: '👻', id: 'phantom' },
    { name: 'WalletConnect', icon: '🔗', id: 'walletconnect' },
    { name: 'Coinbase Wallet', icon: '🔵', id: 'coinbase' },
    { name: 'Trust Wallet', icon: '💙', id: 'trust' },
    { name: 'Rainbow', icon: '🌈', id: 'rainbow' }
  ];

  // Wallet connection functions
const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const balance = await window.ethereum.request({ 
          method: 'eth_getBalance', 
          params: [accounts[0], 'latest'] 
        });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        
        setWalletInfo({
          address: accounts[0],
          balance: balanceInEth,
          chainId: parseInt(chainId, 16),
          walletType: 'MetaMask'
        });
        setWalletConnected(true);
        setShowWalletModal(false);
        
        // Simulate loading user data
        loadUserData();
      } else {
        alert('MetaMask is not installed!');
      }
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
    }
  };

  const connectPhantom = async () => {
    try {
      if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const balance = await window.solana.request({ 
          method: 'getBalance',
          params: [response.publicKey.toString()] 
        });
        
        setWalletInfo({
          address: response.publicKey.toString(),
          balance: (balance / Math.pow(10, 9)).toFixed(4),
          chainId: 1, // Solana mainnet
          walletType: 'Phantom'
        });
        setWalletConnected(true);
        setShowWalletModal(false);
        loadUserData();
      } else {
        alert('Phantom wallet is not installed!');
      }
    } catch (error) {
      console.error('Error connecting Phantom:', error);
    }
  };

  const connectWallet = async (walletId: string) => {
    switch (walletId) {
      case 'metamask':
        await connectMetaMask();
        break;
      case 'phantom':
        await connectPhantom();
        break;
      case 'walletconnect':
      case 'coinbase':
      case 'trust':
      case 'rainbow':
        // Simulate connection for other wallets
        setWalletInfo({
          address: '0x' + Math.random().toString(16).substr(2, 40),
          balance: (Math.random() * 10).toFixed(4),
          chainId: 1,
          walletType: walletId
        });
        setWalletConnected(true);
        setShowWalletModal(false);
        loadUserData();
        break;
      default:
        console.log('Wallet not supported yet');
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletInfo(null);
    setUserStats({
      totalCollateral: 0,
      totalBorrowed: 0,
      availableCredit: 0,
      creditScore: 0,
      healthFactor: 0,
      liquidationThreshold: 0.85
    });
    setZkProofs([]);
  };

  const loadUserData = () => {
    // Simulate loading user data after wallet connection
    setTimeout(() => {
      setUserStats({
        totalCollateral: 45000,
        totalBorrowed: 28000,
        availableCredit: 17000,
        creditScore: 750,
        healthFactor: 1.8,
        liquidationThreshold: 0.85
      });
    }, 1000);
  };

  const generateZkProof = async (type: 'credit' | 'collateral') => {
    setIsGeneratingProof(true);
    
    // Simulate zk-proof generation
    const newProof: ZkProof = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      status: 'pending',
      description: type === 'credit' ? 'Proof of good repayment behavior' : 'Proof of sufficient collateral',
      timestamp: Date.now()
    };
    
    setZkProofs(prev => [...prev, newProof]);
    
    // Simulate proof generation process
    setTimeout(() => {
      setZkProofs(prev => prev.map(proof => 
        proof.id === newProof.id 
          ? { ...proof, status: Math.random() > 0.1 ? 'verified' : 'failed' }
          : proof
      ));
      setIsGeneratingProof(false);
    }, 3000);
  };

  const calculateHealthFactor = (): string => {
    const collateralValue = userStats.totalCollateral;
    const borrowedValue = userStats.totalBorrowed;
    const liquidationThreshold = userStats.liquidationThreshold;
    
    if (borrowedValue === 0) return '∞';
    return ((collateralValue * liquidationThreshold) / borrowedValue).toFixed(2);
  };

  const getHealthFactorColor = (factor: string): string => {
    const numFactor = parseFloat(factor);
    if (numFactor >= 2) return 'text-green-400';
    if (numFactor >= 1.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-300 text-sm">{title}</h3>
        <Icon className={`text-${color}-400`} size={20} />
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {change && (
        <div className={`text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
  );

  const OrderBookRow: React.FC<OrderBookRowProps> = ({ order }) => (
    <div className={`flex justify-between items-center p-3 rounded-lg ${
      order.type === 'lend' ? 'bg-green-900/20 border border-green-500/20' : 'bg-red-900/20 border border-red-500/20'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          order.type === 'lend' ? 'bg-green-400' : 'bg-red-400'
        }`} />
        <span className="text-white font-medium">{order.rate}% APR</span>
      </div>
      <div className="text-gray-300">${order.amount.toLocaleString()}</div>
    </div>
  );

  const WalletModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
          <button
            onClick={() => setShowWalletModal(false)}
            className="text-gray-400 hover:text-white"
          >
            <XCircle size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          {supportedWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => connectWallet(wallet.id)}
              className="w-full flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <span className="text-2xl">{wallet.icon}</span>
              <span className="text-white font-medium">{wallet.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            By connecting a wallet, you agree to NebulaLend's Terms of Service
          </p>
        </div>
      </div>
    </div>
  );

  const ZkProofCard = ({ proof }: { proof: ZkProof }) => (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{proof.description}</span>
        <div className="flex items-center gap-2">
          {proof.status === 'verified' && <CheckCircle className="text-green-400" size={16} />}
          {proof.status === 'failed' && <XCircle className="text-red-400" size={16} />}
          {proof.status === 'pending' && <RefreshCw className="text-yellow-400 animate-spin" size={16} />}
        </div>
      </div>
      <div className="text-xs text-gray-400">
        {new Date(proof.timestamp).toLocaleString()}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">NebulaLend</h1>
                <p className="text-gray-400 text-sm">Trustless Collateralized Lending</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-sm">StarkNet L2</span>
              </div>
              
              {walletConnected && walletInfo ? (
                <div className="flex items-center gap-2">
                  <div className="bg-green-900/20 border border-green-500/20 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-sm">
                        {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(walletInfo.address)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Wallet size={16} />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            <TabButton id="dashboard" label="Dashboard" icon={BarChart3} />
            <TabButton id="zkproof" label="zk-Proofs" icon={Shield} />
            <TabButton id="lend" label="Lend" icon={Plus} />
            <TabButton id="borrow" label="Borrow" icon={Minus} />
            <TabButton id="orderbook" label="Order Book" icon={TrendingUp} />
            <TabButton id="liquidations" label="Liquidations" icon={AlertTriangle} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Market Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Value Locked" 
                value={`$${(marketData.totalValueLocked / 1000000).toFixed(1)}M`}
                change={8.2}
                icon={DollarSign}
                color="blue"
              />
              <StatCard 
                title="Total Borrowed" 
                value={`$${(marketData.totalBorrowed / 1000000).toFixed(1)}M`}
                change={-2.1}
                icon={TrendingUp}
                color="purple"
              />
              <StatCard 
                title="Active Loans" 
                value={marketData.activeLoans.toLocaleString()}
                change={15.3}
                icon={Users}
                color="green"
              />
              <StatCard 
                title="Average APR" 
                value={`${marketData.averageAPR}%`}
                change={0.8}
                icon={BarChart3}
                color="yellow"
              />
            </div>

            {/* User Position */}
            {walletConnected && walletInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Your Position</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{walletInfo.walletType}</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Wallet Balance</span>
                      <span className="font-semibold">{walletInfo.balance} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Collateral</span>
                      <span className="font-semibold">${userStats.totalCollateral.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Borrowed</span>
                      <span className="font-semibold">${userStats.totalBorrowed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Available Credit</span>
                      <span className="font-semibold text-green-400">${userStats.availableCredit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Health Factor</span>
                      <span className={`font-bold ${getHealthFactorColor(calculateHealthFactor())}`}>
                        {calculateHealthFactor()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Credit Score</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPrivateData(!showPrivateData)}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        {showPrivateData ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Lock className="text-purple-400" size={20} />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">
                      {showPrivateData ? userStats.creditScore : '•••'}
                    </div>
                    <div className="text-gray-400 mb-4">
                      {showPrivateData ? 'Excellent' : 'Privacy Protected'}
                    </div>
                    <div className="bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: showPrivateData ? `${(userStats.creditScore / 850) * 100}%` : '0%' }}
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      {showPrivateData ? 'Based on zk-SNARK verified history' : 'Enable privacy to view score'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Assets */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6">Supported Assets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <div key={asset.symbol} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-xs text-gray-400">{asset.name}</div>
                        </div>
                      </div>
                      <div className={`text-sm ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change >= 0 ? '+' : ''}{asset.change}%
                      </div>
                    </div>
                    <div className="text-lg font-bold mb-1">${asset.price.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Max LTV: {(asset.ltv * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* zk-Proofs Tab */}
        {activeTab === 'zkproof' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">zk-SNARK Proofs</h2>
              <div className="text-sm text-gray-400">
                Privacy-preserving verification system
              </div>
            </div>
            
            {walletConnected ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Generate New Proof</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => generateZkProof('credit')}
                        disabled={isGeneratingProof}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                      >
                        <Shield size={20} />
                        {isGeneratingProof ? 'Generating...' : 'Proof of Credit History'}
                      </button>
                      <button
                        onClick={() => generateZkProof('collateral')}
                        disabled={isGeneratingProof}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                      >
                        <Lock size={20} />
                        {isGeneratingProof ? 'Generating...' : 'Proof of Collateral'}
                      </button>
                    </div>
                    <div className="text-sm text-gray-400">
                      Generate zero-knowledge proofs to verify your creditworthiness without revealing sensitive data.
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Your Proofs</h3>
                  <div className="space-y-3">
                    {zkProofs.length > 0 ? (
                      zkProofs.map((proof) => (
                        <ZkProofCard key={proof.id} proof={proof} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Shield size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No proofs generated yet</p>
                        <p className="text-sm">Generate your first zk-proof to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                <Wallet size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Connect Wallet Required</h3>
                <p className="text-gray-400 mb-4">
                  Connect your wallet to generate and manage zk-proofs
                </p>
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        )}

        {/* Order Book Tab */}
        {activeTab === 'orderbook' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Interest Rate Order Book</h2>
              <button className="flex items-center
                            justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">
                <RefreshCw size={16} className="animate-spin" />
                Refresh Rates
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lending Orders</h3>
                {orderBook.filter(o => o.type === 'lend').map((order, i) => (
                  <OrderBookRow key={i} order={order} />
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Borrowing Orders</h3>
                {orderBook.filter(o => o.type === 'borrow').map((order, i) => (
                  <OrderBookRow key={i} order={order} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Borrow Tab Placeholder */}
        {activeTab === 'borrow' && (
          <div className="text-center py-20 text-gray-400">
            <Minus size={48} className="mx-auto mb-4" />
            <p className="text-lg">Borrowing feature coming soon...</p>
          </div>
        )}

        {/* Lend Tab Placeholder */}
        {activeTab === 'lend' && (
          <div className="text-center py-20 text-gray-400">
            <Plus size={48} className="mx-auto mb-4" />
            <p className="text-lg">Lending feature coming soon...</p>
          </div>
        )}

        {/* Liquidations Placeholder */}
        {activeTab === 'liquidations' && (
          <div className="text-center py-20 text-gray-400">
            <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-lg">Liquidation events will appear here</p>
          </div>
        )}
      </main>

      {showWalletModal && <WalletModal />}
    </div>
  );
};

export default NebulaLendPlatform;
