import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';
import { TokenDefinition, YieldData } from '@notional-finance/core-entities';
import {
  DataTableColumn,
  MultiValueIconCell,
  DisplayCell,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useRatesTable = (deposit: TokenDefinition | undefined) => {
  const {
    yields: { variableLend, fCashLend, fCashBorrow, variableBorrow },
  } = useAllMarkets(deposit?.network);

  const getTokenData = (dataSet: YieldData[]) => {
    return dataSet.filter((token) => token?.underlying?.id === deposit?.id);
  };

  const variableLendData = getTokenData(variableLend);
  const fixedLendData = getTokenData(fCashLend);
  const fixedBorrowData = getTokenData(fCashBorrow);
  const variableBorrowData = getTokenData(variableBorrow);

  const variableRatesData = [
    {
      maturity: {
        symbol: variableLendData[0]?.underlying?.symbol,
        label: 'Variable',
      },
      lend_apy: variableLendData[0]?.totalAPY || 0,
      borrow_apy: variableBorrowData[0]?.totalAPY || 0,
    },
  ];

  const fixedRatesData = fixedLendData.map(
    ({ underlying, token, totalAPY }, index) => {
      return {
        maturity: {
          symbol: underlying?.symbol,
          label: formatMaturity(token.maturity || 0),
          caption: 'Fixed Rate',
        },
        lend_apy: totalAPY || 0,
        borrow_apy: fixedBorrowData[index]?.totalAPY || 0,
      };
    }
  );

  const ratesColumns: DataTableColumn[] = [
    {
      header: (
        <FormattedMessage
          defaultMessage="Maturity"
          description={'maturity header'}
        />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'maturity',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Lend APY"
          description={'Lend APY header'}
        />
      ),
      cell: DisplayCell,
      displayFormatter: formatNumberAsPercent,
      accessorKey: 'lend_apy',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Borrow APY"
          description={'Borrow APY header'}
        />
      ),
      cell: DisplayCell,
      displayFormatter: formatNumberAsPercent,
      accessorKey: 'borrow_apy',
      textAlign: 'right',
    },
  ];

  return { ratesColumns, ratesData: [...variableRatesData, ...fixedRatesData] };
};
