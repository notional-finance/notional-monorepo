import { Network } from '@notional-finance/util';

export function getNetworkIdFromHostname(hostname: string) {
  if (hostname.endsWith('sad-yonath-181142.netlify.app')) {
    return 1;
  } else if (hostname.endsWith('kovan-v2.netlify.app')) {
    return 42;
  }

  switch (hostname) {
    case 'notional.finance':
      return 1;
    case 'develop.notional.finance':
      return 5;
    case 'localhost':
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

export function getEtherscanLink(txnHash: string, network?: Network) {
  switch (network) {
    case Network.Mainnet:
      return `https://etherscan.io/tx/${txnHash}`;
    case Network.ArbitrumOne:
      return `https://arbiscan.io/tx/${txnHash}`;
    default:
      return '';
  }
}
