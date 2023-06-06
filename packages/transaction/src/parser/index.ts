import { getProviderFromNetwork, Network } from '@notional-finance/util';
import { BigNumber, PopulatedTransaction } from 'ethers';
import {
  Transfer as _TransferType,
  TransferBundle,
} from '../.graphclient/index';

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

export interface Transfer
  extends Omit<
    _TransferType,
    'id' | 'blockNumber' | 'transactionHash' | 'operator' | 'valueInUnderlying'
  > {
  value: BigNumber;
}

export interface Bundle
  extends Omit<
    TransferBundle,
    'id' | 'blockNumber' | 'timestamp' | 'transactionHash' | 'transfers'
  > {
  transfers: Transfer[];
}

// Token Type
export const Underlying = 'Underlying';
export const nToken = 'nToken';
export const PrimeCash = 'PrimeCash';
export const PrimeDebt = 'PrimeDebt';
export const fCash = 'fCash';
export const VaultShare = 'VaultShare';
export const VaultDebt = 'VaultDebt';
export const VaultCash = 'VaultCash';
export const NOTE = 'NOTE';

// System Account
export const None = 'None';
export const ZeroAddress = 'ZeroAddress';
export const FeeReserve = 'FeeReserve';
export const SettlementReserve = 'SettlementReserve';
// export const nToken = 'nToken'; NOTE: duplicated above
export const Vault = 'Vault';
export const Notional = 'Notional';

// Transfer Type
export const Mint = 'Mint';
export const Burn = 'Burn';
export const _Transfer = 'Transfer';

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
