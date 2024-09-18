export default function useNetworkTokens() {
  const mainnetTokens: string[] = ['USDC', 'rETH', 'USDT', 'ETH', 'wstETH', 'DAI', 'sDAI', 'ARB', 'GHO', 'wBTC', 'FRAX'];
  const arbTokens: string[] = [
    'USDC',
    'rETH',
    'USDT',
    'ETH',
    'wstETH',
    'DAI',
    'wBTC',
    'ARB',
    'wBTC',
    'FRAX',
    'LDO',
    'UNI',
    'cbETH',
    'LINK',
    'RDNT'
  ];

  return { mainnetTokens, arbTokens };
};
