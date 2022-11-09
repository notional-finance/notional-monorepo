import { getDateString, getNowSeconds } from '@notional-finance/utils';
import { defineMessages, useIntl } from 'react-intl';
import { BorderCell } from '@notional-finance/mui';
import { useMarkets, useNotional } from '@notional-finance/notionable-hooks';
import { Market } from '@notional-finance/sdk/src/system';
import { getAmountKeys } from './amount-keys';
import { LEND_BORROW } from '@notional-finance/utils';

const headers = defineMessages({
  tenor: {
    defaultMessage: 'Tenor',
    description: 'table heading',
  },
  maturity: {
    defaultMessage: 'Maturity',
    description: 'table heading',
  },
  apy: {
    defaultMessage: 'APY',
    description: 'table heading',
  },
});

export const useCalculatedRates = (
  selectedToken: string,
  selectedMarketKey: string | null,
  tradeAction: LEND_BORROW
) => {
  const intl = useIntl();
  const { notional } = useNotional();
  const markets = useMarkets(selectedToken);
  const amountKeys = getAmountKeys(selectedToken);
  const defaultColumns = [
    {
      Header: intl.formatMessage(headers.tenor),
      accessor: 'tenor',
      textAlign: 'left',
      Cell: BorderCell,
      padding: '0px',
    },
    {
      Header: intl.formatMessage(headers.maturity),
      accessor: 'maturity',
      Cell: BorderCell,
      padding: '0px',
    },
    {
      Header: intl.formatMessage(headers.apy),
      accessor: 'apy',
      Cell: BorderCell,
      padding: '0px',
    },
  ];

  const specificAmountColumns = amountKeys.map(({ key }) => {
    const accessor = key === '0.5' ? 'pointFive' : key;
    return {
      Header: key,
      accessor,
      Cell: BorderCell,
      padding: '0px',
    };
  });

  const tableData = markets.map((m) => {
    const defaultTableData = {
      tenor: m.tenor,
      maturity: getDateString(m.maturity),
      apy: m.midRate,
      rowSelected: m.marketKey === selectedMarketKey,
    };

    const amountData = amountKeys.reduce((_obj, { key, value }) => {
      const accessor = key === '0.5' ? 'pointFive' : key;
      const obj = _obj;
      let rate = '-';
      try {
        const parsedCashValue =
          tradeAction === LEND_BORROW.LEND
            ? notional?.parseInput(value, m.underlyingSymbol, true)?.neg()
            : notional?.parseInput(value, m.underlyingSymbol, true);
        const fCash =
          parsedCashValue && m.getfCashAmountGivenCashAmount(parsedCashValue.toUnderlying(true));

        if (fCash && parsedCashValue) {
          const r = Market.exchangeToInterestRate(
            Market.exchangeRate(fCash, parsedCashValue),
            getNowSeconds(),
            m.maturity
          );

          rate = r === undefined || r === 0 ? '-' : Market.formatInterestRate(r);
        }
      } catch {
        // If errors, the rate returned will be '--'
      }

      obj[accessor] = rate;
      return obj;
    }, {} as Record<string, string>);

    return { ...defaultTableData, ...amountData };
  });

  const tableColumns = defaultColumns.concat(specificAmountColumns);

  return {
    tableData,
    tableColumns,
  };
};
