import { providers as ethersProviders } from 'ethers';

export function getProviders(key: string) {
  const mainnetProvider = new ethersProviders.JsonRpcBatchProvider({
    url: `https://eth-mainnet.g.alchemy.com/v2/${key}`,
    skipFetchSetup: true,
  });

  const goerliProvider = new ethersProviders.JsonRpcBatchProvider({
    url: `https://eth-goerli.g.alchemy.com/v2/${key}`,
    skipFetchSetup: true,
  });

  return {
    mainnet: mainnetProvider,
    goerli: goerliProvider,
  };
}
