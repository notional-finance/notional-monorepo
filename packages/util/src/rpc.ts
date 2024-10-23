import { Network } from './constants';

export function getNetworkIdFromHostname(hostname: string) {
  switch (hostname) {
    case 'notional.finance':
      return 1;
    case 'www.notional.finance':
      return 1;
    case 'beta.notional.finance':
      return 1;
    case 'dev.notional.finance':
      return 5;
    case 'localhost:3000':
      return 5;
    default:
      return 5;
  }
}

export function networkName(id: number) {
  switch (id) {
    case 1:
      return 'mainnet';
    case 3:
      return 'ropsten';
    case 4:
      return 'rinkeby';
    case 5:
      return 'goerli';
    case 42:
      return 'kovan';
    case 1337:
      return 'unknown';
    default:
      return 'local';
  }
}

export function getRpcUrl(networkId: number) {
  switch (networkId) {
    case 1:
      return 'https://eth-mainnet.alchemyapi.io/v2/JU05SBqaAUg1-2xYuUvvJlE2-zcFKSwz';
    case 5:
      return 'https://eth-goerli.alchemyapi.io/v2/u9PaziJgX-8l4j8_c88b777-Io4scNUe';
    default:
      return 'https://eth-goerli.alchemyapi.io/v2/u9PaziJgX-8l4j8_c88b777-Io4scNUe';
  }
}

export function getEtherscanTransactionLink(
  txnHash: string,
  network?: Network
) {
  switch (network) {
    case Network.mainnet:
      return `https://etherscan.io/tx/${txnHash}`;
    case Network.arbitrum:
      return `https://arbiscan.io/tx/${txnHash}`;
    default:
      return '';
  }
}

export function getEtherscanAddressLink(
  contractAddress: string,
  network?: Network
) {
  switch (network) {
    case Network.mainnet:
      return `https://etherscan.io/address/${contractAddress}#code`;
    case Network.arbitrum:
      return `https://arbiscan.io/address/${contractAddress}#code`;
    default:
      return '';
  }
}

export function isTestHost() {
  return (
    globalThis.location.hostname === 'arbitrum-dev.notional.finance' ||
    globalThis.location.hostname === 'dev.notional.finance' ||
    globalThis.location.hostname === 'localhost:3000'
  );
}
