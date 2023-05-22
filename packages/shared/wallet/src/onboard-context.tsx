import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import gnosisModule from '@web3-onboard/gnosis';
import ledgerModule from '@web3-onboard/ledger';
import trezorModule from '@web3-onboard/trezor';
import coinbaseModule from '@web3-onboard/coinbase';
import {
  getProviderURLFromNetwork,
  Network,
  NetworkId,
} from '@notional-finance/util';

const chains = [
  {
    id: `0x${NetworkId[Network.ArbitrumOne].toString(16)}`,
    token: 'ETH',
    label: 'Arbitrum One',
    rpcUrl: getProviderURLFromNetwork(Network.All),
  },
];

const email = process.env['NX_CONTACT_EMAIL'] as string;
const appUrl = process.env['NX_APP_URL'] as string;

const wallets = [
  injectedModule(),
  walletConnectModule(),
  gnosisModule(),
  ledgerModule(),
  trezorModule({
    email,
    appUrl,
  }),
  coinbaseModule(),
];

export const OnboardContext = init({
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
