import { useState, useMemo, useEffect } from 'react';
import { useMoneyMarket } from '@notional-finance/notionable-hooks';
import {
  ExpandableCurrencyCell,
  ChevronCell,
  MultiValueCell,
  NegativeValueCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { formatCryptoWithFiat } from '@notional-finance/utils';
import { TypedBigNumber } from '@notional-finance/sdk';
import { FormattedMessage } from 'react-intl';

type ExpandedRows = {
  [key: string]: boolean;
};

export const useMoneyMarketTable = () => {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const moneyMarket = useMoneyMarket();

  const moneyMarketColumns: DataTableColumn[] = useMemo(() => {
    return [
      {
        Header: '',
        expandableTable: true,
        Cell: ChevronCell,
        accessor: 'chevron',
        textAlign: 'left',
      },
      {
        Header: <FormattedMessage defaultMessage="Currency" description={'Currency header'} />,
        expandableTable: true,
        Cell: ExpandableCurrencyCell,
        accessor: 'currency',
        textAlign: 'left',
      },
      {
        Header: <FormattedMessage defaultMessage="Balance" description={'Balance header'} />,
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'balance',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage defaultMessage="Current Yield" description={'Current Yield header'} />
        ),
        expandableTable: true,
        Cell: NegativeValueCell,
        accessor: 'currentYield',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Interest Earned"
            description={'Interest Earned header'}
          />
        ),
        expandableTable: true,
        Cell: NegativeValueCell,
        accessor: 'interestEarned',
        textAlign: 'right',
      },
    ];
  }, []);

  const isTbnZero = (tbn: TypedBigNumber | undefined) => {
    return !tbn || tbn.isZero()
      ? { displayValue: '-' }
      : {
          displayValue: tbn.toDisplayStringWithSymbol(),
          isNegative: tbn.isNegative(),
        };
  };

  const isPercentStringZero = (percent: string | undefined) => {
    return !percent || percent === '0.000%'
      ? { displayValue: '-' }
      : {
          displayValue: percent,
          isNegative: percent.includes('-'),
        };
  };

  const moneyMarketData = useMemo(() => {
    return moneyMarket.map((data) => {
      return {
        currency: {
          symbol: data.assetSymbol,
          underlyingSymbol: data.underlyingSymbol || data.assetSymbol,
        },
        isNegative: data.balance.isNegative(),
        balance: formatCryptoWithFiat(data.balance),
        currentYield: isPercentStringZero(data.currentYield),
        interestEarned: isTbnZero(data.interestEarned),
      };
    });
  }, [moneyMarket]);

  useEffect(() => {
    const formattedExpandedRows = moneyMarketData.reduce((accumulator, _value, index) => {
      return { ...accumulator, [index]: index === 0 ? true : false };
    }, {});

    if (expandedRows === null && JSON.stringify(formattedExpandedRows) !== '{}') {
      setExpandedRows(formattedExpandedRows);
    }
  }, [moneyMarketData, expandedRows, setExpandedRows]);

  return { moneyMarketData, moneyMarketColumns, initialState, setExpandedRows };
};
