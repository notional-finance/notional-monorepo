import { http, createConfig } from 'wagmi';
import { mainnet, arbitrum } from 'wagmi/chains';
import {
  injected,
  safe,
  walletConnect,
  coinbaseWallet,
} from 'wagmi/connectors';

const projectId = '4c1aab455337c5172aeeaa076b5104e4';
// @ts-ignore
export const WagmiConfig = createConfig({
  chains: [mainnet, arbitrum],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId }),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
});
