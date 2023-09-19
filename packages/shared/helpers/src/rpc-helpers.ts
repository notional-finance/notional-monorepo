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

export function getContractUrls(tokenSymbol: string) {
  const key = tokenSymbol.toLowerCase();
  const contractURLs = {
    eth: {
      nToken: 'https://arbiscan.io/address/0x18b0Fc5A233acF1586Da7C199Ca9E3f486305A29',
      prime: 'https://arbiscan.io/address/0xabc07bf91469c5450d6941dd0770e6e6761b90d6'
    },
    dai: {
      nToken: 'https://arbiscan.io/address/0x2C42940A06A3F78b3cB7fc62b5fc7DE404c9216f',
      prime: 'https://arbiscan.io/address/0x0Ace2DC3995aCD739aE5e0599E71A5524b93b886'
    },
    usdc: {
      nToken: 'https://arbiscan.io/address/0x0F13fb925eDC3E1FE947209010d9c0E072986ADc',
      prime: 'https://arbiscan.io/address/0x6f28cafe12bd97E474a52bcbfEa6F2c18AE0F53D'
    },
    wbtc: {
      nToken: 'https://arbiscan.io/address/0x52602A1075645845a303f86B2BD0b7E7227f99d6',
      prime: 'https://arbiscan.io/address/0xB9bFBB35C2eD588a42f9Fd1120929c607B463192'
    },
    wsteth: {
      nToken: 'https://arbiscan.io/address/0x06D45ef1f8b3C37b0de66f156B11F10b4837619A',
      prime: 'https://arbiscan.io/address/0xbC323E3564Fb498E55CDc83a3Ea6bB1AF8402D6B'
    },
    frax: {
      nToken: 'https://arbiscan.io/address/0x69633657acfb930d5a97a2662dd32ef1ac8a2f57',
      prime: 'https://arbiscan.io/address/0x1fd865a55eaf5333e6374Fb3Ad66D22e9885d3Aa'
    },
    reth: {
      nToken: 'https://arbiscan.io/address/0x6f6603f12af215bdba1f55f643e098530dd45b8f',
      prime: 'https://arbiscan.io/address/0x866eb09d3d1397b8a28cfe5dceeaed9362840385'
    },
    usdt: {
      nToken: 'https://arbiscan.io/address/0x9c0fbb8cade7b178b135fd2f1da125a37b27f442',
      prime: 'https://arbiscan.io/address/0xd63ace62b925361fc588734022718e919a8081ac'
    }
  }
  return contractURLs[key];
}


