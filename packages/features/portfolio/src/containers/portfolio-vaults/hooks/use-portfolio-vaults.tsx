import {
  ExpandableCurrencyCell,
  ChevronCell,
  ExpandedRows,
  MultiValueCell,
  DataTableColumn,
  NegativeValueCell,
} from '@notional-finance/mui';
import { useVaultRiskProfiles } from '@notional-finance/notionable-hooks';
import { formatCryptoWithFiat } from '@notional-finance/helpers';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { useEffect, useMemo, useState } from 'react';
import { formatRateAsPercent } from '@notional-finance/risk/helpers/risk-data-helpers';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/shared-config';

export const usePortfolioVaults = () => {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const vaults = useVaultRiskProfiles();

  const vaultSummaryColumns: DataTableColumn[] = useMemo(() => {
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
            defaultMessage="Vault"
            description="column header"
          />
        ),
        expandableTable: true,
        Cell: ExpandableCurrencyCell,
        accessor: 'vault',
        textAlign: 'left',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Maturity"
            description="column header"
          />
        ),
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'maturity',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Net Worth"
            description="column header"
          />
        ),
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'netWorth',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage defaultMessage="APY" description="column header" />
        ),
        expandableTable: true,
        Cell: NegativeValueCell,
        accessor: 'apy',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Profit"
            description="column header"
          />
        ),
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'profit',
        textAlign: 'right',
      },
    ];
  }, []);

  const vaultSummaryData = vaults.map((v) => {
    const config = v.vaultConfig;
    // TODO: need to fill out this data
    const apy = 0;
    const profit = v.netWorth();

    return {
      vault: {
        symbol: v.defaultSymbol,
        label: config.name,
      },
      maturity: {
        // TODO: what about prime cash maturity here?
        data: [
          moment.unix(v.maturity || 0).format('MMM DD YYYY'),
          moment.unix(v.maturity || 0).format('hh:mm A'),
        ],
      },
      netWorth: formatCryptoWithFiat(v.netWorth()),
      apy: {
        displayValue: formatRateAsPercent(apy, 3),
        isNegative: apy && apy < 0,
      },
      profit: formatCryptoWithFiat(profit),
      actionRow: {
        maturity: v.maturity ? moment.unix(v.maturity).format() : undefined,
        routes: {
          manageVault: `/portfolio/${PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS}/manage-vault/?vaultAddress=${v.vaultAddress}`,
        },
      },
    };
  });

  useEffect(() => {
    const formattedExpandedRows = vaultSummaryData.reduce(
      (accumulator, _value, index) => {
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
  }, [vaultSummaryData, expandedRows, setExpandedRows]);

  return {
    vaultSummaryColumns,
    vaultSummaryData,
    setExpandedRows,
    initialState,
  };
};
