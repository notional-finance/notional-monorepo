import { Observable } from 'rxjs';

type GenericObservable<T> = Observable<T>;
export type ExtractObservableReturn<T> = T extends GenericObservable<infer X>
  ? X
  : never;

type DataServiceAccountContextUpdate = {
  name: 'AccountContextUpdate';
  params: {
    account: string;
  };
};

type DataServiceTransferBatch = {
  name: 'TransferBatch';
  params: {
    operator: string;
    from: string;
    to: string;
    ids: string[];
    values: string[];
  };
};
type DataServiceTransferSingle = {
  name: 'TransferSingle';
  params: {
    operator: string;
    from: string;
    to: string;
    id: string;
    value: string;
  };
};

export type DataServiceReinvestmentTrade = {
  name: 'ReinvestmentTrade';
  params: {
    network: string;
    vaultAddress: string;
    timestamp: number;
    txHash: string;
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
    sellTokenPrice: string;
    buyTokenPrice: string;
    lossPercentage: number;
  };
};

export type DataServiceEvent =
  | DataServiceTransferSingle
  | DataServiceTransferBatch
  | DataServiceAccountContextUpdate;

export enum DataServiceEndpoints {
  BLOCKS = 'blocks',
  BACKFILL_ORACLE_DATA = 'backfillOracleData',
  BACKFILL_YIELD_DATA = 'backfillYieldData',
  BACKFILL_GENERIC_DATA = 'backfillGenericData',
  VAULT_APY = 'vaultApy',
  REINVESTMENT_TRADES = 'reinvestmentTrades',
  EVENTS = 'events',
  ACCOUNTS = 'accounts',
  VAULT_ACCOUNTS = 'vaultAccounts',
  VIEWS = 'views',
  READINESS_CHECK = 'readiness_check',
  QUERY = 'query',
}
