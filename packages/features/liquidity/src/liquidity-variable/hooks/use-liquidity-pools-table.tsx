import { DataTableColumn } from '@notional-finance/mui';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { LiquidityContext } from '../../liquidity';
// import { HistoricalTrading } from '@notional-finance/notionable';

export const useLiquidityPoolsTable = () => {
  const {
    state: { deposit, selectedNetwork },
  } = useContext(LiquidityContext);
  const {
    globalState: { historicalTrading },
  } = useNotionalContext();
  let poolTableData: Record<string, any>[] = [];

  if (deposit && deposit?.currencyId && selectedNetwork && historicalTrading) {
    poolTableData = historicalTrading[selectedNetwork][deposit?.currencyId]
      .slice(0, 25)
      .map(
        ({
          bundleName,
          currencyId,
          fCashId,
          fCashValue,
          pCash,
          pCashInUnderlying,
          timestamp,
          blockNumber,
          transactionHash,
        }) => {
          console.log({
            currencyId,
            fCashId,
            fCashValue,
            pCash,
            pCashInUnderlying,
            timestamp,
            blockNumber,
            transactionHash,
          });
          let action = '';
          if (bundleName.includes('Buy')) {
            action = bundleName.includes('Vault') ? 'Lend (Vault)' : 'Lend';
          } else {
            action = bundleName.includes('Vault') ? 'Borrow (Vault)' : 'Borrow';
          }

          return {
            action: action,
            details: fCashValue,
            interestRate: pCashInUnderlying,
            time: timestamp,
          };
        }
      );
  }

  console.log({ poolTableData });

  const columns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Action"
          description={'action header'}
        />
      ),
      accessor: 'action',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Details"
          description={'details header'}
        />
      ),
      accessor: 'details',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Interest Rate"
          description={'interest rate header'}
        />
      ),
      accessor: 'interestRate',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Time" description={'time header'} />
      ),
      accessor: 'time',
      textAlign: 'right',
    },
  ];

  return { columns };
};
