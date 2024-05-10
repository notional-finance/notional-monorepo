import { useTheme } from '@mui/material';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import {
  formatNumberAsAbbr,
  formatNumberAsPercent,
  truncateAddress,
} from '@notional-finance/helpers';
import { DisplayCell, ViewAsAddressCell } from '@notional-finance/mui';
import {
  formatHealthFactorValues,
  useFiat,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

interface Test {
  address: string;
  hasCrossCurrencyRisk: boolean;
  riskFactors: {
    netWorth: TokenBalance;
    freeCollateral: TokenBalance;
    loanToValue: number;
    collateralRatio: number | null;
    leverageRatio: number | null;
    healthFactor: number | null;
  };
}

export const useAllAccounts = (selectedNetwork: Network) => {
  const theme = useTheme();
  const [allAccounts, setAllAccounts] = useState<Test[] | undefined>(undefined);
  const { updateNotional } = useNotionalContext();
  const baseCurrency = useFiat();
  const history = useHistory();
  const [healthFactorOptions, setHealthFactorOptions] = useState([]);
  const [crossCurrencyRiskOptions, setCrossCurrencyRiskOptions] = useState([]);
  const [netWorthOptions, setNetWorthOptions] = useState([]);

  const fetchAllAccounts = async () => {
    const { portfolioRisk } =
      await Registry.getAnalyticsRegistry().getAccountRisk(selectedNetwork);
    const allAccountsData = await portfolioRisk;
    if (allAccountsData) {
      setAllAccounts(allAccountsData);
    }
  };

  // useEffect(() => {
  //   setCrossCurrencyRiskOptions([]);
  //      setHealthFactorOptions([]);
  // }, [earnBorrowOption, allNetworksOption]);

  useEffect(() => {
    if (selectedNetwork) {
      fetchAllAccounts();
    }
  }, [selectedNetwork]);

  const addressClick = useCallback(
    (address: string, network) => {
      updateNotional({
        hasSelectedChainError: false,
        wallet: {
          signer: undefined,
          selectedAddress: address,
          isReadOnlyAddress: true,
          label: 'ReadOnly',
        },
        selectedNetwork: network,
      });

      history.push(`/portfolio/${network}/overview`);
    },
    [history, updateNotional]
  );

  const tableColumns = [
    {
      header: (
        <FormattedMessage defaultMessage="Address" description={'Address'} />
      ),
      cell: ViewAsAddressCell,
      cellCallBack: addressClick,
      showLinkIcon: false,
      accessorKey: 'address',
      textAlign: 'left',
      width: '265px',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Cross Currency Risk"
          description={'Cross Currency Risk'}
        />
      ),
      accessorKey: 'crossCurrencyRisk',
      textAlign: 'right',
      width: '265px',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Health Factor"
          description={'Health Factor'}
        />
      ),
      enableSorting: true,
      sortingFn: 'basic',
      cell: DisplayCell,
      displayFormatter: (val) => {
        const { value, textColor } = formatHealthFactorValues(val, theme);
        return <span style={{ color: textColor }}>{value}</span>;
      },
      accessorKey: 'healthFactor',
      textAlign: 'right',
      width: '265px',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Loan To Value"
          description={'Loan To Value'}
        />
      ),
      cell: DisplayCell,
      displayFormatter: formatNumberAsPercent,
      enableSorting: true,
      sortingFn: 'basic',
      accessorKey: 'loanToValue',
      textAlign: 'right',
      width: '265px',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Net Worth"
          description={'Net Worth'}
        />
      ),
      enableSorting: true,
      cell: DisplayCell,
      displayFormatter: (val) => formatNumberAsAbbr(val, 2, baseCurrency),
      sortingFn: 'basic',
      accessorKey: 'netWorth',
      textAlign: 'right',
      width: '265px',
    },
  ];

  const tableDataTest = allAccounts?.map((data) => {
    return {
      address: {
        text: data.address ? truncateAddress(data.address) : '-',
        fullAddress: `${data.address}`,
        network: selectedNetwork,
      },
      crossCurrencyRisk: data.hasCrossCurrencyRisk ? 'Yes' : 'No',
      healthFactor: data.riskFactors.healthFactor
        ? data.riskFactors.healthFactor
        : 0,
      loanToValue:
        data.riskFactors.loanToValue !== undefined
          ? data.riskFactors.loanToValue
          : 0,
      netWorth: data.riskFactors.netWorth
        ? data.riskFactors.netWorth.toFiat(baseCurrency).toFloat()
        : 0,
    };
  });

  const sortedTableData = tableDataTest?.sort((a, b) => {
    if (a.healthFactor === 0 && b.healthFactor === 0) {
      return 0;
    } else if (a.healthFactor === 0) {
      return 1;
    } else if (b.healthFactor === 0) {
      return -1;
    } else {
      return a.healthFactor - b.healthFactor;
    }
  });

  const dropdownsData = [
    {
      selectedOptions: healthFactorOptions,
      setSelectedOptions: setHealthFactorOptions,
      placeHolderText: <FormattedMessage defaultMessage={'Health Factor'} />,
      data: [
        {
          id: 'less_than_1.25',
          title: '< 1.25',
        },
        {
          id: 'less_than_2.5',
          title: '< 2.5',
        },
        {
          id: 'no_risk',
          title: 'No Risk',
        },
      ],
    },
    {
      selectedOptions: crossCurrencyRiskOptions,
      crossCurrencyRiskOptions: setCrossCurrencyRiskOptions,
      placeHolderText: <FormattedMessage defaultMessage={'CC Risk'} />,
      data: [
        {
          id: 'yes',
          title: 'yes',
        },
        {
          id: 'no',
          title: 'No',
        },
      ],
    },
    {
      selectedOptions: netWorthOptions,
      setSelectedOptions: setNetWorthOptions,
      placeHolderText: <FormattedMessage defaultMessage={'Net Worth'} />,
      data: [
        {
          id: 'greater_than_100',
          title: '> $100',
        },
        {
          id: 'greater_than_1000',
          title: '> $1,000',
        },
        {
          id: 'greater_than_100000',
          title: '> $100,000',
        },
      ],
    },
  ];

  // TODO:
  // Add No Risk to health factor filter to remove the null values
  // Add Net worth filter

  return {
    tableData:
      sortedTableData && sortedTableData.length > 0 ? sortedTableData : [],
    tableColumns,
    dropdownsData,
  };

  // NOTE:
  // Can sort the health factors that are null at the buttom at the beginning but not after you click sort

  //   Address: use the copy / click to view portfolio cell

  // Cross Currency Risk (yes = true, no = false) add toggle or dropdown filter

  // [Sortable] Health Factor (format as a number with 4 decimal places). By default, sort the table with the lowest health factors at the top.

  // If a health factor is null then sort it to the bottom. It should have a value of "-"

  // [Sortable] Loan To Value (format as a percentage with 2 decimal places), similar to health factor if this is null then show "-", null values should sort to the bottom of the table

  // [Sortable] Net Worth (format using netWorth.toFiat(baseCurrency).toDisplayStringWithSymbol(2, true, false) )
};
