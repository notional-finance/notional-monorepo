import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectedOptions } from '@notional-finance/mui';
import { useLocation } from 'react-router-dom';

export const useTxnHistoryDropdowns = (
  txnHistoryCategory: number,
  allCurrencyOptions: any[],
  allAssetOrVaultOptions: any[]
) => {
  const { search } = useLocation();
  const [currencyOptions, setCurrencyOptions] = useState<
    SelectedOptions[] | []
  >([]);
  const [assetOrVaultOptions, setAssetOrVaultOptions] = useState<
    SelectedOptions[] | []
  >([]);

  useEffect(() => {
    setAssetOrVaultOptions([]);
    setCurrencyOptions([]);
  }, [txnHistoryCategory]);

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const assetOrVaultId = queryParams?.get('assetOrVaultId');
    const debtId = queryParams?.get('debtId') || '';

    if (queryParams && assetOrVaultId) {
      const urlOption = allAssetOrVaultOptions.filter(
        ({ id }) => id === assetOrVaultId || id === debtId
      );
      if (urlOption && assetOrVaultOptions.length === 0) {
        setAssetOrVaultOptions([...urlOption]);
      }
    }
  }, [search, allAssetOrVaultOptions, assetOrVaultOptions]);

  const dropdownsData = [
    {
      selectedOptions: currencyOptions,
      setSelectedOptions: setCurrencyOptions,
      data: allCurrencyOptions,
      placeHolderText: <FormattedMessage defaultMessage={'Currency'} />,
    },
    {
      selectedOptions: assetOrVaultOptions,
      setSelectedOptions: setAssetOrVaultOptions,
      placeHolderText:
        txnHistoryCategory === 0 ? (
          <FormattedMessage defaultMessage={'Assets'} />
        ) : (
          <FormattedMessage defaultMessage={'Vaults'} />
        ),
      data: allAssetOrVaultOptions,
    },
  ];

  return {
    dropdownsData,
    currencyOptions,
    assetOrVaultOptions,
  };
};

export default useTxnHistoryDropdowns;
