import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectedOptions } from '@notional-finance/mui';
import { TXN_HISTORY_TYPE } from '@notional-finance/util';
import { useLocation, useHistory } from 'react-router-dom';

export const useTxnHistoryDropdowns = (
  txnHistoryType: TXN_HISTORY_TYPE,
  allCurrencyOptions: any[],
  allAssetOrVaultOptions: any[]
) => {
  const { search, pathname } = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(search);
  const [currencyOptions, setCurrencyOptions] = useState<
    SelectedOptions[] | []
  >([]);
  const [assetOrVaultOptions, setAssetOrVaultOptions] = useState<
    SelectedOptions[] | []
  >([]);

  // NOTE: This function is passed down and used by the multi-select-dropdown component and the data-table-filter-bar component
  // Used to clear the query params and the selected options in the dropdowns
  // If we want to filter by asset from the query in the future that will need to be added here as well as in the table we are linking from

  const clearQueryAndFilters = () => {
    if (queryParams && queryParams.get('assetOrVaultId')) {
      queryParams.delete('assetOrVaultId');
      history.push(`${pathname}?${queryParams.toString()}`);
      setAssetOrVaultOptions([]);
    }
  };

  useEffect(() => {
    setAssetOrVaultOptions([]);
    setCurrencyOptions([]);
  }, [txnHistoryType]);

  // const handleSetAssets = (assetOrVaultId, debtId) => {};

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
        txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS ? (
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
    clearQueryAndFilters,
  };
};

export default useTxnHistoryDropdowns;
