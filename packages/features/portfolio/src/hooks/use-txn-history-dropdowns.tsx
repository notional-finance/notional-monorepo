import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { TXN_HISTORY_TYPE } from '@notional-finance/shared-config';

export const useTxnHistoryDropdowns = (
  txnHistoryType: TXN_HISTORY_TYPE,
  allCurrencyOptions: any[],
  allAssetOrVaultOptions: any[]
) => {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [assetOrVaultOptions, setAssetOrVaultOptions] = useState([]);

  useEffect(() => {
    setAssetOrVaultOptions([]);
    setCurrencyOptions([]);
  }, [txnHistoryType]);

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

  return { dropdownsData, currencyOptions, assetOrVaultOptions };
};

export default useTxnHistoryDropdowns;
