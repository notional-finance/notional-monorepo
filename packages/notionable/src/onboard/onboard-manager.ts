import Onboard, { OnboardAPI, WalletState } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import gnosisModule from '@web3-onboard/gnosis';
import ledgerModule from '@web3-onboard/ledger';
import trezorModule from '@web3-onboard/trezor';
import coinbaseModule from '@web3-onboard/coinbase';
import {
  BehaviorSubject,
  of,
  forkJoin,
  from,
  distinctUntilChanged,
  share,
  catchError,
  mergeMap,
  map,
  withLatestFrom,
} from 'rxjs';
import {
  chains as supportedChains,
  chainIds as supportedChainIds,
} from '../chains';
import NotionalIcon from '../assets/notional.svg';
import { providers } from 'ethers';
import { setInLocalStorage } from '@notional-finance/util';
import {
  updateOnboardState,
  resetOnboardState,
  modules$,
} from './onboard-store';
import { OnboardOptions, SupportedWallet } from '../types';
import { WalletModule, Chain } from '@web3-onboard/common';
import { ConnectedChain } from '@web3-onboard/core';
import { reportNotionalError } from '../error/error-manager';
import { account$ } from '../account/account-store';

const email = process.env['NX_CONTACT_EMAIL'] as string;
const appUrl = process.env['NX_APP_URL'] as string;

const injected = injectedModule();
const walletConnect = walletConnectModule();
const gnosis = gnosisModule();
const ledger = ledgerModule();
const trezor = trezorModule({
  email,
  appUrl,
});
const coinbase = coinbaseModule();

let onboard: OnboardAPI;
export const supportedWallets = [
  'MetaMask',
  'WalletConnect',
  'Ledger',
  'Trezor',
  'Coinbase Wallet',
];

const _walletUpdatesBs = new BehaviorSubject<WalletState[]>([]);
const walletUpdates$ = _walletUpdatesBs.asObservable().pipe();

export async function setChain(chainId: string | number) {
  try {
    const { wallets } = onboard.state.get();
    const [wallet] = wallets;
    if (wallet) {
      const chainSet = await onboard.setChain({ chainId });
      setInLocalStorage('selectedChain', chainId);
      return chainSet;
    } else {
      return false;
    }
  } catch (e) {
    console.error(e);
    throw new Error("Couldn't set chain");
  }
}

export async function connectWallet(label?: string) {
  try {
    const opts = label
      ? { autoSelect: { label, disableModals: true } }
      : undefined;
    const [wallet] = await onboard.connectWallet(opts);

    if (wallet) {
      setInLocalStorage('selectedWallet', wallet.label);
    }
  } catch (e) {
    console.error(e);
    throw new Error("Couldn't connect to wallet");
  }
}

export async function resetWallet(label: string) {
  await onboard.disconnectWallet({ label });
}

export async function resetAllWallets() {
  setInLocalStorage('selectedWallet', null);
  const { wallets } = await onboard.state.get();
  await Promise.all(
    wallets.map(({ label }) => onboard.disconnectWallet({ label }))
  );
}

export function getOnboard() {
  return onboard;
}

export async function initializeOnboard({
  enableAccountCenter = false,
  container = '#root',
}: OnboardOptions) {
  const opts = getOnboardOptions({ enableAccountCenter, container });
  onboard = Onboard(opts);
  onboard.state.select('wallets').subscribe(_walletUpdatesBs);
  onboard.state.select('chains').subscribe(handleChainsUpdated);
  onboard.state
    .select('walletModules')
    .pipe(
      mergeMap((modules) =>
        forkJoin(
          modules.map((m: WalletModule) => {
            const { label, getIcon } = m;
            return from(getIcon()).pipe(map((icon) => ({ label, icon })));
          })
        )
      )
    )
    .subscribe({ next: handleWalletModulesChange });
  onboard.state.actions.setWalletModules(opts.wallets);
}

function hasWalletChanged([prev]: WalletState[], [curr]: WalletState[]) {
  if (prev && curr) {
    const [prevAccount] = prev.accounts;
    const [currAccount] = curr.accounts;
    const [prevChain] = prev.chains;
    const [currChain] = curr.chains;
    return (
      prevAccount.address === currAccount.address &&
      prevChain.id === currChain.id
    );
  }
  return false;
}

function handleWalletModulesChange(modules: SupportedWallet[]) {
  updateOnboardState({ modules });
}

function handleChainsUpdated(chains: Chain[]) {
  updateOnboardState({ chains });
}

function getOnboardOptions({
  enableAccountCenter = false,
  container = '#root',
}: OnboardOptions) {
  return {
    accountCenter: {
      desktop: {
        enabled: enableAccountCenter,
        containerElement: container,
      },
      mobile: {
        enabled: enableAccountCenter,
        containerElement: container,
      },
    },
    appMetadata: {
      name: 'Notional',
      description: 'Select a wallet to connect to Notional',
      icon: NotionalIcon,
      recommendedInjectedWallets: [
        { name: 'MetaMask', url: 'https://metamask.io' },
      ],
    },
    wallets: [injected, walletConnect, gnosis, ledger, trezor, coinbase],
    chains: supportedChains,
  };
}

account$.subscribe((account) => {
  if (onboard && account) {
    const { wallets } = onboard.state.get();
    if (wallets && wallets.length > 0) {
      const { accounts } = wallets[0];
      const [acct] = accounts;
      if (
        acct &&
        acct.address &&
        acct.address.toLowerCase() !== account.address.toLowerCase()
      ) {
        resetAllWallets();
      }
    }
  }
});

walletUpdates$
  .pipe(
    distinctUntilChanged(hasWalletChanged),
    withLatestFrom(modules$),
    map(([[wallet], modules]) => {
      let _provider;
      let _signer;
      let _address = '';
      let _icon = '';
      let _label = '';
      let _chain: ConnectedChain | null = null;
      let _accounts: string[] = [];

      if (wallet && wallet.provider) {
        const { label, icon, accounts, chains } = wallet;
        const [account] = accounts;
        const [chain] = chains;

        if (
          chain &&
          chain.id &&
          supportedChainIds.includes(parseInt(chain.id))
        ) {
          _provider = new providers.Web3Provider(wallet.provider);
          _signer = _provider.getSigner();
          _icon = btoa(icon ?? '');
          _address = account?.address ?? '';
          _label = label;
          _chain = chain ?? null;
          _accounts = accounts?.map((a) => a.address) ?? [];

          return {
            signer: _signer,
            connected: !!_provider && !!_signer,
            chain: _chain,
            address: _address,
            icon: _icon,
            label: _label,
            accounts: _accounts,
          };
        } else {
          return {
            ...resetOnboardState,
            connected: true,
            chain,
            icon: _icon,
            label: _label,
            modules,
          };
        }
      } else {
        return { ...resetOnboardState, modules };
      }
    }),
    catchError((err) => {
      reportNotionalError(
        { ...err, msgId: 'global.error.unsupportedChain', code: 500 },
        'onboard-manager',
        'wallet-updates'
      );
      return of({ ...resetOnboardState });
    }),
    share()
  )
  .subscribe({ next: updateOnboardState });
