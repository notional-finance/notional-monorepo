import { Network } from './constants';

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
    globalThis.location.hostname === 'exponent.notional.finance' ||
    globalThis.location.hostname === 'dev.notional.finance' ||
    globalThis.location.hostname === 'localhost:3000'
  );
}
