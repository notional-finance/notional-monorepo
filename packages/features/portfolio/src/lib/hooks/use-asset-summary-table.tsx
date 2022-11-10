import { useState, useMemo, useEffect } from 'react';
import { useAssetSummary } from '@notional-finance/notionable-hooks';
import { MaturityData } from '@notional-finance/notionable';
import { LEND_BORROW, formatCryptoWithFiat, formatMaturity } from '@notional-finance/utils';
import {
  ExpandableCurrencyCell,
  ChevronCell,
  BorderCell,
  MultiValueCell,
  DateTimeCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { Market } from '@notional-finance/sdk/src/system';
import moment from 'moment';

type ExpandedRows = {
  [key: string]: boolean;
};

export const useAssetSummaryTable = (borrowOrLend: LEND_BORROW) => {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const assetSummary = useAssetSummary(borrowOrLend);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};

  const assetSummaryColumns: DataTableColumn[] = useMemo(() => {
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
        Header: <FormattedMessage defaultMessage="Maturity" description={'Maturity header'} />,
        expandableTable: true,
        Cell: DateTimeCell,
        accessor: 'maturity',
        textAlign: 'left',
      },
      {
        Header: (
          <FormattedMessage defaultMessage="Current Value" description={'Current Value header'} />
        ),
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'currentValue',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Due at Maturity"
            description={'Due at Maturity header'}
          />
        ),
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'dueAtMaturity',
        textAlign: 'right',
      },
      {
        Header: <FormattedMessage defaultMessage="Fixed APY" description={'Fixed APY header'} />,
        expandableTable: true,
        Cell: BorderCell,
        accessor: 'fixedApy',
        textAlign: 'right',
      },
    ];
  }, []);

  const formatMaturities = (maturities: MaturityData[]) => {
    return maturities.map((data) => ({
      marketKey: data.marketKey,
      maturity: formatMaturity(data.maturity),
      tradeRateString: data.tradeRateString,
      rollMaturityRoute: data.rollMaturityRoute,
    }));
  };

  const assetSummaryData = useMemo(() => {
    return assetSummary.map((data) => {
      return {
        currency: {
          symbol: data.underlyingSymbol,
        },
        maturity: data.maturity,
        currentValue: formatCryptoWithFiat(data.currentValue),
        dueAtMaturity: formatCryptoWithFiat(data.dueAtMaturity),
        fixedApy: data?.fixedAPY ? Market.formatInterestRate(data.fixedAPY) : '-',
        rollMaturities: data?.rollMaturities?.length ? formatMaturities(data.rollMaturities) : [],
        borrowOrLend: LEND_BORROW.LEND,
        rawMaturity: moment.unix(data.maturity).format(),
        removeAssetRoute: data.removeAssetRoute,
      };
    });
  }, [assetSummary]);

  useEffect(() => {
    const formattedExpandedRows = assetSummaryData.reduce((accumulator, value, index) => {
      return { ...accumulator, [index]: index === 0 ? true : false };
    }, {});

    if (expandedRows === null && JSON.stringify(formattedExpandedRows) !== '{}') {
      setExpandedRows(formattedExpandedRows);
    }
  }, [assetSummaryData, expandedRows, setExpandedRows]);

  return { assetSummaryData, assetSummaryColumns, initialState, setExpandedRows };
};
