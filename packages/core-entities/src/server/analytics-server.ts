import { ActiveAccountsDocument } from '../.graphclient';
import { CacheSchema } from '../Definitions';
import {
  fetchGraph,
  loadGraphClientDeferred,
  ServerRegistry,
} from './server-registry';
import {
  convertArrayToObject,
  getNowSeconds,
  Network,
  SECONDS_IN_DAY,
} from '@notional-finance/util';

export class AnalyticsServer extends ServerRegistry<Record<string, unknown>> {
  protected async _refresh(network: Network) {
    const {
      HistoricalOracleValuesDocument,
      HistoricalTradingActivityDocument,
      VaultReinvestmentDocument,
    } = await loadGraphClientDeferred();
    const minTimestamp = getNowSeconds() - 90 * SECONDS_IN_DAY;

    const { finalResults: historicalOracles, blockNumber } = await fetchGraph(
      network,
      HistoricalOracleValuesDocument,
      // Key = oracleId
      (r) => convertArrayToObject(r.oracles, 'id'),
      { minTimestamp },
      'oracles'
    );

    const { finalResults: historicalTrading } = await fetchGraph(
      network,
      HistoricalTradingActivityDocument,
      (r) => {
        // Key = currencyId
        return convertArrayToObject(
          r.tradingActivity.map((t) => {
            // Simplify the trading activity information into a single line item
            const fCashValue: string = t.transfers[2].value;
            const fCashId: string = t.transfers[2].token.id;
            const pCash: string = t.transfers[0].value;
            const pCashInUnderlying: string = t.transfers[0].valueInUnderlying;

            return {
              bundleName: t.bundleName,
              currencyId: t.transfers[0].token.currencyId,
              fCashId,
              fCashValue,
              pCash,
              pCashInUnderlying,
              timestamp: t.timestamp,
              blockNumber: t.blockNumber as number,
              transactionHash: t.transactionHash.id,
            };
          }),
          'currencyId'
        );
      },
      {},
      'tradingActivity'
    );

    const { finalResults: vaultReinvestment } = await fetchGraph(
      network,
      VaultReinvestmentDocument,
      // Key = vault id
      (r) =>
        convertArrayToObject(
          r.reinvestments.map((i) => ({ ...i, vault: i.vault.id })),
          'vault'
        ),
      { minTimestamp },
      'reinvestments'
    );

    const { finalResults: activeAccounts } = await fetchGraph(
      network,
      ActiveAccountsDocument,
      (r) => {
        const activeAccounts = r.accounts
          .flatMap(
            (a) =>
              a.balances
                ?.filter((b) => b.current.currentBalance !== '0')
                .map(
                  (b) =>
                    `${
                      b.token.tokenType === 'fCash' && b.token.isfCashDebt
                        ? 'fCashDebt'
                        : b.token.tokenType
                    }:${b.token.currencyId}`
                ) || []
          )
          .reduce((acc, v) => {
            if (acc[v]) acc[v] += 1;
            else acc[v] = 1;
            return acc;
          }, {} as Record<string, number>);
        const totalActive = r.accounts.filter(
          (a) =>
            (a.balances?.filter((b) => b.current.currentBalance !== '0') || [])
              .length > 0
        ).length;

        return Object.assign(activeAccounts, { totalActive });
      },
      {},
      'accounts'
    );

    return {
      values: [
        ['historicalOracles', historicalOracles],
        ['historicalTrading', historicalTrading],
        ['vaultReinvestment', vaultReinvestment],
        ['activeAccounts', activeAccounts],
      ],
      network,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: blockNumber,
    } as CacheSchema<Record<string, unknown>>;
  }
}
