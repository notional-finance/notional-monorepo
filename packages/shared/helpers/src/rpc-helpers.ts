export function getNetworkIdFromHostname(hostname: string) {
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
      return 'https://eth-mainnet.g.alchemy.com/v2/JU05SBqaAUg1-2xYuUvvJlE2-zcFKSwz';
    default:
      return 'https://eth-mainnet.g.alchemy.com/v2/JU05SBqaAUg1-2xYuUvvJlE2-zcFKSwz';
  }
}



