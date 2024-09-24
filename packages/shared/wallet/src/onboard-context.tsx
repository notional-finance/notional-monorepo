import { init } from '@web3-onboard/react';
import { OnboardAPI } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
} from '@web3-onboard/injected-wallets/dist/types';
import walletConnectModule from '@web3-onboard/walletconnect';
import safeModule from '@web3-onboard/gnosis';
import coinbaseModule from '@web3-onboard/coinbase';
import MetaMask from './images/meta-mask.svg';
import Safe from './images/safe.svg';
import CoinbaseWallet from './images/coinbase-wallet.svg';
import trezorModule from '@web3-onboard/trezor';
import WalletConnect from './images/wallet-connect.svg';
import Trezor from './images/trezor.svg';
import {
  getProviderURLFromNetwork,
  Network,
  NetworkId,
} from '@notional-finance/util';

export const chains = [
  {
    id: `0x${NetworkId[Network.arbitrum].toString(16)}`,
    token: 'ETH',
    label: Network.arbitrum,
    rpcUrl: getProviderURLFromNetwork(Network.arbitrum),
  },
  {
    id: `0x${NetworkId[Network.mainnet].toString(16)}`,
    token: 'ETH',
    label: Network.mainnet,
    rpcUrl: getProviderURLFromNetwork(Network.mainnet),
  },
];

const providers: EIP6963ProviderDetail[] | any[] = [];
// @ts-ignore: this is needed to get over a window type conflict with EIP6963AnnounceProviderEvent
window.addEventListener(
  'eip6963:announceProvider',
  (event: EIP6963AnnounceProviderEvent) => {
    providers.push(event.detail);
  }
);
window.dispatchEvent(new Event('eip6963:requestProvider'));
interface ResultInterface {
  label: string;
  icon: string;
}

export const useWalletModules = () => {
  const modules = [
    {
      label: 'MetaMask',
      icon: MetaMask,
    },
    {
      label: 'Coinbase Wallet',
      icon: CoinbaseWallet,
    },
    {
      label: 'WalletConnect',
      icon: WalletConnect,
    },
    {
      label: 'Trezor',
      icon: Trezor,
    },
    {
      label: 'Safe',
      icon: Safe,
    },
  ];
  const checkProvider = new Map<string, boolean>();
  const injectedWallets: ResultInterface[] = [];

  providers
    .filter(
      ({ info }) =>
        !info.name?.includes('Coinbase') && !info.name?.includes('MetaMask')
    )
    .forEach(({ info }) => {
      if (checkProvider.has(info.name)) return info;
      checkProvider.set(info.name, true);
      injectedWallets.push({
        label: info.name,
        icon: info.icon,
      });
      return info;
    });

  return injectedWallets.length > 0
    ? [...injectedWallets, ...modules]
    : modules;
};

const email = process.env['NX_CONTACT_EMAIL'] as string;
const appUrl = process.env['NX_APP_URL'] as string;

const wcV2InitOptions = {
  projectId: '4c1aab455337c5172aeeaa076b5104e4',
  requiredChains: [42161, 1],
  dappUrl: 'https://notional.finance/',
};

const wallets = [
  injectedModule(),
  coinbaseModule(),
  walletConnectModule(wcV2InitOptions),
  trezorModule({
    email,
    appUrl,
  }),
  safeModule(),
];

export const OnboardContext: OnboardAPI = init({
  wallets,
  chains,
  accountCenter: {
    desktop: {
      enabled: false,
      containerElement: '#root',
    },
    mobile: {
      enabled: false,
      containerElement: '#root',
    },
  },
  connect: {
    autoConnectLastWallet: true,
  },
  appMetadata: {
    name: 'Notional',
    description: 'Select a wallet to connect to Notional',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  },
});
