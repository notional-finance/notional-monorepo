import { useEffect, useMemo, useState } from 'react';
import {
  useTransactionHistory,
  useSelectedNetwork,
  usePendingPnLCalculation,
  useCurrentNetworkStore,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { SelectedOptions } from '@notional-finance/mui';
import { useLocation } from 'react-router-dom';

export const useTxnHistoryData = () => {
  const network = useSelectedNetwork();
  const pendingTokenData = usePendingPnLCalculation(network);
  const accountHistory = useTransactionHistory(network);
  const model = useCurrentNetworkStore();
  const { search } = useLocation();
  const [selectedVaultFilter, setVaultFilter] = useState<
    SelectedOptions[] | []
  >([]);

  const allVaultOptions = useMemo(() => {
    const _vaultFilter = accountHistory?.reduce((f, { vaultAddress }) => {
      f.add(vaultAddress);
      return f;
    }, new Set<string>());

    return Array.from(_vaultFilter?.keys() || []).map((vaultAddress) => ({
      id: vaultAddress,
      title: model.getVaultConfig(vaultAddress)?.name || vaultAddress,
      // icon: model.getVaultConfig(vaultAddress)?.icon || '',
    }));
  }, [accountHistory, model]);

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const vaultId = queryParams?.get('vaultId');
    if (vaultId) {
      setVaultFilter(allVaultOptions.filter(({ id }) => id === vaultId));
    } else {
      setVaultFilter(allVaultOptions);
    }
  }, [allVaultOptions, search]);

  const filterData = [
    {
      selectedOptions: selectedVaultFilter,
      setSelectedOptions: setVaultFilter,
      data: allVaultOptions,
      placeHolderText: <FormattedMessage defaultMessage={'Vaults'} />,
    },
  ];

  return {
    accountHistory: accountHistory
      ?.filter(({ vaultAddress }) =>
        selectedVaultFilter.some(({ id }) => id === vaultAddress)
      )
      .map(({ amountToFromWallet, ...rest }) => ({
        ...rest,
        isDebt: amountToFromWallet?.isNegative(),
        amountToFromWallet:
          amountToFromWallet
            ?.abs()
            ?.toDisplayStringWithSymbol(4, true, false) || '-',
      })),
    filterData,
    pendingTokenData,
  };
};
