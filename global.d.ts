interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (...args: any[]) => void;
  removeListener?: (...args: any[]) => void;
}

interface Window {
  ethereum?: EthereumProvider;
  solana?: any; // also helps with Phantom wallet
}