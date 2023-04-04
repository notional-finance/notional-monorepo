import { useState, useMemo, useEffect } from 'react';
import { useNTokenHoldings } from '@notional-finance/notionable-hooks';
import {
  ExpandableCurrencyCell,
  ChevronCell,
  MultiValueCell,
  NegativeValueCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  formatNumberAsPercent,
  formatCryptoWithFiat,
} from '@notional-finance/helpers';

type ExpandedRows = {
  [key: string]: boolean;
};

export const useLiquidityOverviewTable = () => {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const nTokenHoldings = useNTokenHoldings();

  const liquidityOverviewColumns: DataTableColumn[] = useMemo(() => {
    return [
      {
        Header: '',
        expandableTable: true,
        Cell: ChevronCell,
        accessor: 'chevron',
        textAlign: 'left',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Currency"
            description={'Currency header'}
          />
        ),
        expandableTable: true,
        Cell: ExpandableCurrencyCell,
        accessor: 'currency',
        textAlign: 'left',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Present Value"
            description={'Present Value header'}
          />
        ),
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'presentValue',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Organic Returns"
            description={'Organic Returns header'}
          />
        ),
        expandableTable: true,
        Cell: NegativeValueCell,
        accessor: 'organicReturns',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Note Incentives"
            description={'Note Incentives header'}
          />
        ),
        expandableTable: true,
        Cell: NegativeValueCell,
        accessor: 'noteIncentives',
        textAlign: 'right',
      },
    ];
  }, []);

  const isPercentZero = (percent: number | undefined) => {
    return !percent || percent === 0
      ? { displayValue: '-' }
      : {
          displayValue: formatNumberAsPercent(percent),
          isNegative: Math.sign(percent) === -1,
        };
  };

  const nTokenHoldingsHashKey = nTokenHoldings.map((n) => n.hashKey).join(':');
  const liquidityOverviewData = useMemo(() => {
    return nTokenHoldings?.map((data) => {
      return {
        currency: {
          symbol: data.underlyingSymbol,
        },
        nTokenSymbol: data.nTokenSymbol,
        presentValue: formatCryptoWithFiat(data?.presentValue),
        organicReturns: isPercentZero(data.organicYield),
        noteIncentives: isPercentZero(data.noteIncentiveYield),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nTokenHoldings, nTokenHoldingsHashKey]);

  useEffect(() => {
    const formattedExpandedRows = nTokenHoldings.reduce(
      (accumulator, _, index) => {
        return { ...accumulator, [index]: index === 0 ? true : false };
      },
      {}
    );

    if (
      expandedRows === null &&
      JSON.stringify(formattedExpandedRows) !== '{}'
    ) {
      setExpandedRows(formattedExpandedRows);
    }
  }, [nTokenHoldings, expandedRows, setExpandedRows]);

  return {
    liquidityOverviewData,
    liquidityOverviewColumns,
    initialState,
    setExpandedRows,
  };
};
