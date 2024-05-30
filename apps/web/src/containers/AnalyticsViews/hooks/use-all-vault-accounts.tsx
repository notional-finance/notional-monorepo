import { useTheme } from '@mui/material';
import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  formatNumberAsAbbr,
  formatNumberToDigits,
  truncateAddress,
} from '@notional-finance/helpers';
import { DisplayCell, ViewAsAddressCell } from '@notional-finance/mui';
import {
  formatHealthFactorValues,
  useAllVaults,
  useFiat,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { findSortingNum } from './use-all-accounts';

interface VaultAccountData {
  account: string;
  vaultAddress: string;
  vaultName: string;
  riskFactors: {
    netWorth: TokenBalance;
    debts: TokenBalance;
    assets: TokenBalance;
    collateralRatio: number | null;
    healthFactor: number | null;
    liquidationPrice: {
      asset: TokenDefinition;
      threshold: TokenBalance | null;
      isDebtThreshold: boolean;
    }[];
    aboveMaxLeverageRatio: boolean;
    leverageRatio: number | null;
  };
}

export const useAllVaultAccounts = (selectedNetwork: Network) => {
  const theme = useTheme();
  const listedVaults = useAllVaults(selectedNetwork);
  const [allVaultAccounts, setAllVaultAccounts] = useState<
    VaultAccountData[] | undefined
  >(undefined);
  const { updateNotional } = useNotionalContext();
  const baseCurrency = useFiat();
  const history = useHistory();
  const [healthFactorOptions, setHealthFactorOptions] = useState([]);
  const [vaultNameOptions, setVaultNameOptions] = useState([]);

  const fetchAllVaultAccounts = async () => {
    const { vaultRisk } = await Registry.getAnalyticsRegistry().getAccountRisk(
      selectedNetwork
    );
    const allVaultAccountsData = await vaultRisk;
    if (allVaultAccountsData) {
      setAllVaultAccounts(allVaultAccountsData);
    }
  };

  useEffect(() => {
    if (selectedNetwork) {
      fetchAllVaultAccounts();
      setVaultNameOptions([]);
      setHealthFactorOptions([]);
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
      width: '180px',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Vault Name"
          description={'Vault Name'}
        />
      ),
      accessorKey: 'vaultName',
      textAlign: 'right',
      width: '250px',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Leverage Ratio"
          description={'Leverage Ratio'}
        />
      ),
      enableSorting: true,
      sortingFn: 'basic',
      cell: DisplayCell,
      displayFormatter: (val) => formatNumberToDigits(val, 4),
      accessorKey: 'leverageRatio',
      textAlign: 'right',
      width: '180px',
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
      width: '180px',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Net Worth"
          description={'Net Worth'}
        />
      ),
      enableSorting: true,
      sortingFn: 'basic',
      cell: DisplayCell,
      displayFormatter: (val) =>
        formatNumberAsAbbr(val, 2, baseCurrency, { removeKAbbr: true }),
      accessorKey: 'netWorth',
      textAlign: 'right',
      width: '180px',
    },
    {
      header: (
        <FormattedMessage defaultMessage="Assets" description={'Assets'} />
      ),
      cell: DisplayCell,
      enableSorting: true,
      sortingFn: 'basic',
      displayFormatter: (val) =>
        formatNumberAsAbbr(val, 2, baseCurrency, { removeKAbbr: true }),
      accessorKey: 'assets',
      textAlign: 'right',
      width: '180px',
    },
    {
      header: <FormattedMessage defaultMessage="Debts" description={'Debts'} />,
      enableSorting: true,
      cell: DisplayCell,
      sortingFn: 'basic',
      displayFormatter: (val) =>
        formatNumberAsAbbr(val, 2, baseCurrency, { removeKAbbr: true }),
      accessorKey: 'debts',
      textAlign: 'right',
      width: '180px',
      isDebt: true,
    },
  ];

  const tableData = allVaultAccounts
    ?.map((data) => {
      return {
        address: {
          text: data.account ? truncateAddress(data.account) : '-',
          fullAddress: `${data.account}`,
          network: selectedNetwork,
        },
        vaultName: data.vaultName,
        leverageRatio: data.riskFactors.leverageRatio || 0,
        healthFactor: data.riskFactors.healthFactor
          ? data.riskFactors.healthFactor
          : 0,
        netWorth: data.riskFactors.netWorth
          ? data.riskFactors.netWorth.toFiat(baseCurrency).toFloat()
          : 0,
        assets: data.riskFactors.assets
          ? data.riskFactors.assets.toFiat(baseCurrency).toFloat()
          : 0,
        debts: data.riskFactors.debts
          ? data.riskFactors.debts.toFiat(baseCurrency).toFloat()
          : 0,
      };
    })
    .sort((a, b) => b.leverageRatio - a.leverageRatio);

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
      selectedOptions: vaultNameOptions,
      setSelectedOptions: setVaultNameOptions,
      placeHolderText: <FormattedMessage defaultMessage={'Vault Name'} />,
      data: listedVaults.map(({ name }) => {
        return {
          id: name,
          title: name,
        };
      }),
    },
  ];

  const initialData = tableData && tableData.length > 0 ? tableData : [];

  const getIds = (options: any[]) => {
    return options.map(({ id }) => id);
  };

  const filterAllVaultAccountsData = () => {
    const healthFactorIds = getIds(healthFactorOptions);
    const highestHealthFactor = findSortingNum(healthFactorIds, true);
    const vaultNameIds = getIds(vaultNameOptions);

    const filterData = [...healthFactorIds, ...vaultNameIds];

    if (filterData.length === 0) return initialData;

    if (
      highestHealthFactor &&
      healthFactorOptions.length > 0 &&
      vaultNameOptions.length > 0
    ) {
      return initialData
        .filter(({ healthFactor }) => healthFactor < highestHealthFactor)
        .filter(({ vaultName }) => vaultNameIds.includes(vaultName));
    }

    if (highestHealthFactor && healthFactorOptions.length > 0) {
      return initialData.filter(
        ({ healthFactor }) => healthFactor < highestHealthFactor
      );
    }

    if (vaultNameOptions.length > 0) {
      return initialData.filter(({ vaultName }) =>
        vaultNameIds.includes(vaultName)
      );
    }

    return initialData;
  };
  const filteredTableData = filterAllVaultAccountsData();

  return {
    tableData: filteredTableData,
    tableColumns,
    dropdownsData,
  };
};
