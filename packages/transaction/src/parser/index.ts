import { getProviderFromNetwork, Network } from '@notional-finance/util';
import { PopulatedTransaction } from 'ethers';

interface AlchemyTransfer {
  assetType: 'ERC20' | 'ERC1155' | 'ERC721' | 'NATIVE';
  changeType: 'TRANSFER';
  from: string;
  to: string;
  rawAmount: string; // string
  contractAddress: string;
}

interface AlchemyResponse {
  result: {
    changes: AlchemyTransfer[];
  };
  gasUsed: string; // Hex value
  error: string;
}

export async function simulatePopulatedTxn(
  network: Network,
  populateTxn: PopulatedTransaction
) {
  const provider = getProviderFromNetwork(network);
  return (await provider.send('alchemy_simulateAssetChanges', [
    {
      from: populateTxn.from,
      to: populateTxn.to,
      value: populateTxn.value,
      data: populateTxn.data,
    },
  ])) as AlchemyResponse;
}
