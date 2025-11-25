export const RECEIVERS: Record<string, string> = {
  ethereum: import.meta.env.VITE_RECV_ETH || import.meta.env.REACT_APP_WALLET_ADDRESS || '',
  polygon: import.meta.env.VITE_RECV_POLYGON || import.meta.env.REACT_APP_WALLET_ADDRESS || '',
  base: import.meta.env.VITE_RECV_BASE || import.meta.env.REACT_APP_WALLET_ADDRESS || '',
  bnb: import.meta.env.VITE_RECV_BNB || import.meta.env.REACT_APP_WALLET_ADDRESS || '',
  arbitrum: import.meta.env.VITE_RECV_ARBITRUM || import.meta.env.REACT_APP_WALLET_ADDRESS || '',
  sei: import.meta.env.VITE_RECV_SEI || import.meta.env.REACT_APP_WALLET_ADDRESS || '',
  solana: import.meta.env.VITE_RECV_SOL || '',
  bitcoin: import.meta.env.VITE_RECV_BTC || '',
};

export default RECEIVERS;
