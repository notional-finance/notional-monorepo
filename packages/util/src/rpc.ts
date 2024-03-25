export function getNetworkIdFromHostname(_hostname: string) {
  return 1;
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

export function getEtherscanLink(txnHash: string, chainId: number) {
  const name = networkName(chainId);
  if (name === 'mainnet') {
    return `https://etherscan.io/tx/${txnHash}`;
  }

  return `https://${name}.etherscan.io/tx/${txnHash}`;
}
