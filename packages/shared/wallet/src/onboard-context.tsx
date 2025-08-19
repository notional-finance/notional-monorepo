import { init } from '@web3-onboard/react';
import {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
} from '@web3-onboard/injected-wallets/dist/types';
import walletConnectModule from '@web3-onboard/walletconnect';
import injectedModule from '@web3-onboard/injected-wallets';
import metamaskSDK from '@web3-onboard/metamask';
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
import { checkMobileView } from '@notional-finance/helpers';

export const chains = [
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
const isMobile = checkMobileView();

export const useWalletModules = () => {
  const modules = isMobile
    ? [
        {
          label: 'MetaMask',
          icon: MetaMask,
        },
        {
          label: 'Coinbase Wallet',
          icon: CoinbaseWallet,
        },
        // {
        //   label: 'WalletConnect',
        //   icon: WalletConnect,
        // },
      ]
    : [
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

  if (isMobile) {
    return modules;
  } else {
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
  }
};

const email = process.env['NX_CONTACT_EMAIL'] as string;
const appUrl = process.env['NX_APP_URL'] as string;

const wcV2InitOptions = {
  version: 2,
  projectId: '4c1aab455337c5172aeeaa076b5104e4',
  requiredChains: [42161, 1],
  // FOR TESTING:
  dappUrl: appUrl || 'https://dev.notional.finance/',
};

const wallets = isMobile
  ? [
      metamaskSDK({
        options: {
          extensionOnly: false,
          dappMetadata: {
            name: 'notional finance',
            url: 'https://dev.notional.finance/',
          },
        },
      }),
      coinbaseModule(),
      // TODO: Fix issues of wallet connect not launching on mobile
      // walletConnectModule(wcV2InitOptions),
    ]
  : [
      injectedModule(),
      walletConnectModule(wcV2InitOptions),
      trezorModule({
        email,
        appUrl,
      }),
      safeModule(),
    ];

export const OnboardContext = init({
  wallets,
  chains,
  accountCenter: {
    desktop: {
      enabled: false,
      containerElement: 'body',
    },
    mobile: {
      enabled: false,
      containerElement: 'body',
    },
  },
  connect: {
    autoConnectLastWallet: true,
  },
  appMetadata: {
    name: 'Notional',
    description: 'Select a wallet to connect to Notional',
    explore: appUrl || 'https://dev.notional.finance/',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
      { name: 'Coinbase Wallet', url: 'https://wallet.coinbase.com/' },
    ],
  },
});
