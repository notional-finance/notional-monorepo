import { init } from '@web3-onboard/react';
import { OnboardAPI } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import gnosisModule from '@web3-onboard/gnosis';
import ledgerModule from '@web3-onboard/ledger';
import trezorModule from '@web3-onboard/trezor';
import coinbaseModule from '@web3-onboard/coinbase';
import MetaMask from './images/meta-mask.svg';
import WalletConnect from './images/wallet-connect.svg';
import Ledger from './images/ledger.svg';
import Trezor from './images/trezor.svg';
import CoinbaseWallet from './images/coinbase-wallet.svg';
import {
  getProviderURLFromNetwork,
  Network,
  NetworkId,
} from '@notional-finance/util';

export const chains = [
  {
    id: `0x${NetworkId[Network.ArbitrumOne].toString(16)}`,
    token: 'ETH',
    label: Network.ArbitrumOne,
    rpcUrl: getProviderURLFromNetwork(Network.ArbitrumOne),
  },
  {
    id: `0x${NetworkId[Network.Mainnet].toString(16)}`,
    token: 'ETH',
    label: Network.Mainnet,
    rpcUrl: getProviderURLFromNetwork(Network.Mainnet),
  },
];

export const modules = [
  {
    label: 'MetaMask',
    icon: MetaMask,
  },
  {
    label: 'WalletConnect',
    icon: WalletConnect,
  },
  {
    label: 'Ledger',
    icon: Ledger,
  },
  {
    label: 'Trezor',
    icon: Trezor,
  },
  {
    label: 'Coinbase Wallet',
    icon: CoinbaseWallet,
  },
];

const email = process.env['NX_CONTACT_EMAIL'] as string;
const appUrl = process.env['NX_APP_URL'] as string;

const wcV2InitOptions = {
  projectId: '4c1aab455337c5172aeeaa076b5104e4',
  requiredChains: [42161],
  dappUrl: 'https://arbitrum.notional.finance/',
};

const wallets = [
  injectedModule(),
  walletConnectModule(wcV2InitOptions),
  gnosisModule(),
  ledgerModule(),
  trezorModule({
    email,
    appUrl,
  }),
  coinbaseModule(),
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
