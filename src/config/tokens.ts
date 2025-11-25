// Minimal token registry for supported networks. Add or change addresses as needed.
export interface TokenInfo {
  symbol: string;
  name?: string;
  address?: string; // undefined for native token
  decimals: number;
  isNative?: boolean;
}

export const TOKENS: Record<string, TokenInfo[]> = {
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', decimals: 18, isNative: true },
    { symbol: 'USDC', name: 'USD Coin', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F6', decimals: 6 },
    { symbol: 'DAI', name: 'Dai', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18 },
    { symbol: 'LINK', name: 'Chainlink', address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', decimals: 18 },
    { symbol: 'UNI', name: 'Uniswap', address: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f1', decimals: 18 },
    { symbol: 'AAVE', name: 'Aave', address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90Bc', decimals: 18 },
  ],
  ethereum: [
    { symbol: 'ETH', name: 'Ether', decimals: 18, isNative: true },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6441e88C5F2712C3E9b74F5b8b6F5b8', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
    { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
  ],
  base: [
    { symbol: 'ETH', name: 'Ether', decimals: 18, isNative: true },
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  ],
  bnb: [
    { symbol: 'BNB', name: 'BNB', decimals: 18, isNative: true },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  ],
  mumbai: [
    { symbol: 'MATIC', name: 'Polygon', decimals: 18, isNative: true },
    { symbol: 'USDC', name: 'USD Coin', address: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23', decimals: 6 },
    { symbol: 'DAI', name: 'Dai', address: '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6', decimals: 18 },
  ],
};

export default TOKENS;
