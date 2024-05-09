import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { ViewAsAddressCell } from '@notional-finance/mui';
import {
  useFiat,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useCallback, useState } from 'react';
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
  const [allAccounts, setAllAccounts] = useState<Test[] | undefined>(undefined);
  const { updateNotional } = useNotionalContext();
  const baseCurrency = useFiat();
  const history = useHistory();
  const fetchAllAccounts = async () => {
    const { portfolioRisk } =
      await Registry.getAnalyticsRegistry().getAccountRisk(selectedNetwork);
    const allAccountsData = await portfolioRisk;

    if (allAccountsData) {
      setAllAccounts([allAccountsData]);
    }
  };

  if (!allAccounts) {
    fetchAllAccounts();
  }

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
      textAlign: 'right',
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
      accessorKey: 'healthFactor',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Loan To Value"
          description={'Loan To Value'}
        />
      ),
      enableSorting: true,
      sortingFn: 'basic',
      accessorKey: 'loanToValue',
      textAlign: 'right',
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
      accessorKey: 'netWorth',
      textAlign: 'right',
    },
  ];

  const tableData = allAccounts?.map(
    ({ address, hasCrossCurrencyRisk, riskFactors }) => {
      return {
        address: address,
        crossCurrencyRisk: hasCrossCurrencyRisk ? 'Yes' : 'No',
        healthFactor: riskFactors.healthFactor
          ? riskFactors.healthFactor
          : null,
        loanToValue: riskFactors.loanToValue ? riskFactors.loanToValue : null,
        netWorth: riskFactors.netWorth
          ? riskFactors.netWorth
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false)
          : null,
      };
    }
  );

  //   Address: use the copy / click to view portfolio cell

  // Cross Currency Risk (yes = true, no = false) add toggle or dropdown filter

  // [Sortable] Health Factor (format as a number with 4 decimal places). By default, sort the table with the lowest health factors at the top.

  // If a health factor is null then sort it to the bottom. It should have a value of "-"

  // [Sortable] Loan To Value (format as a percentage with 2 decimal places), similar to health factor if this is null then show "-", null values should sort to the bottom of the table

  // [Sortable] Net Worth (format using netWorth.toFiat(baseCurrency).toDisplayStringWithSymbol(2, true, false) )

  return { tableData, tableColumns };
};
