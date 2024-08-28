import { useTheme } from '@mui/material';
import {
  FiatKeys,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import {
  formatNumberAsAbbr,
  formatNumberAsPercent,
  truncateAddress,
} from '@notional-finance/helpers';
import { DisplayCell, ViewAsAddressCell } from '@notional-finance/mui';
import {
  formatHealthFactorValues,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

interface AccountData {
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

export const findSortingNum = (
  numbers: number[],
  sortHighestNum?: boolean
): number | undefined => {
  if (numbers.length === 0) {
    return undefined;
  }
  let highestNumber = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > highestNumber && sortHighestNum) {
      highestNumber = numbers[i];
    } else if (numbers[i] < highestNumber) {
      highestNumber = numbers[i];
    }
  }
  return highestNumber;
};

export const useAllAccounts = (
  selectedNetwork: Network,
  baseCurrency: FiatKeys
) => {
  const theme = useTheme();
  const [allAccounts, setAllAccounts] = useState<AccountData[] | undefined>(
    undefined
  );
  const { updateNotional } = useNotionalContext();

  const navigate = useNavigate();
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

  useEffect(() => {
    setCrossCurrencyRiskOptions([]);
    setHealthFactorOptions([]);
    setNetWorthOptions([]);
  }, []);

  useEffect(() => {
    if (selectedNetwork) {
      fetchAllAccounts();
    }
  }, [selectedNetwork]);

  const addressClick = useCallback(
    (address: string, network) => {
      updateNotional({
        wallet: {
          signer: undefined,
          selectedAddress: address,
          isReadOnlyAddress: true,
          label: 'ReadOnly',
        },
        selectedNetwork: network,
      });

      navigate(`/portfolio/${network}/overview`);
    },
    [navigate, updateNotional]
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
      displayFormatter: (val) =>
        formatNumberAsAbbr(val, 2, baseCurrency, { removeKAbbr: true }),
      sortingFn: 'basic',
      accessorKey: 'netWorth',
      textAlign: 'right',
      width: '265px',
    },
  ];

  const tableData = allAccounts?.map((data) => {
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

  const sortedTableData = tableData?.sort((a, b) => {
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
          id: 1.25,
          title: '< 1.25',
        },
        {
          id: 2.5,
          title: '< 2.5',
        },
        {
          id: 5,
          title: 'No Risk',
        },
      ],
    },
    {
      selectedOptions: crossCurrencyRiskOptions,
      setSelectedOptions: setCrossCurrencyRiskOptions,
      placeHolderText: <FormattedMessage defaultMessage={'CC Risk'} />,
      data: [
        {
          id: 'Yes',
          title: 'Yes',
        },
        {
          id: 'No',
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
          id: 100,
          title: '> $100',
        },
        {
          id: 1000,
          title: '> $1,000',
        },
        {
          id: 100000,
          title: '> $100,000',
        },
      ],
    },
  ];

  const initialData =
    sortedTableData && sortedTableData.length > 0 ? sortedTableData : [];

  const getIds = (options: any[]) => {
    return options.map(({ id }) => id);
  };

  const filterAllAccountsData = () => {
    const healthFactorIds = getIds(healthFactorOptions);
    const crossCurrencyRiskIds = getIds(crossCurrencyRiskOptions);
    const netWorthIds = getIds(netWorthOptions);
    const highestHealthFactor = findSortingNum(healthFactorIds, true);
    const highestNetWorth = findSortingNum(netWorthIds);
    const ccRiskOption = crossCurrencyRiskIds[0];

    const filterData = [
      ...healthFactorIds,
      ...crossCurrencyRiskIds,
      ...netWorthIds,
    ];

    if (filterData.length === 0) return initialData;

    return initialData.filter(
      ({ crossCurrencyRisk, healthFactor, netWorth }) => {
        let passFilter = true;

        if (
          crossCurrencyRiskIds.length === 1 &&
          crossCurrencyRisk !== ccRiskOption
        ) {
          passFilter = false;
        }

        if (
          highestHealthFactor !== undefined &&
          healthFactor > highestHealthFactor
        ) {
          passFilter = false;
        }

        if (highestNetWorth !== undefined && netWorth < highestNetWorth) {
          passFilter = false;
        }

        return passFilter;
      }
    );
  };

  const filteredTableData = filterAllAccountsData();

  return {
    tableData: filteredTableData,
    tableColumns,
    dropdownsData,
  };
};
