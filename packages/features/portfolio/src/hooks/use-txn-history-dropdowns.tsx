import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatTokenType } from '@notional-finance/helpers';
import { TXN_HISTORY_TYPE } from '@notional-finance/shared-config';
import { TokenIcon } from '@notional-finance/icons';
import { useTransactionHistory } from '@notional-finance/notionable-hooks';

export const useTxnHistoryDropdowns = (txnHistoryType: TXN_HISTORY_TYPE) => {
  const accountHistory = useTransactionHistory();
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [assetOrVaultOptions, setAssetOrVaultOptions] = useState([]);

  let currencyData: any[] = [];
  let assetData: any[] = [];

  let currencyVaultData: any[] = [];
  let vaultNameData: any[] = [];

  useEffect(() => {
    setAssetOrVaultOptions([]);
    setCurrencyOptions([]);
  }, [txnHistoryType]);

  if (txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS) {
    currencyData = accountHistory
      .filter(({ vaultName }) => !vaultName)
      .map(({ underlying }, index) => ({
        id: index.toString(),
        title: underlying.symbol,
        icon: (
          <TokenIcon size="medium" symbol={underlying.symbol.toLowerCase()} />
        ),
      }));

    assetData = accountHistory
      .filter(({ vaultName }) => !vaultName)
      .map(({ token }, index) => {
        const tokenData = formatTokenType(token);
        return {
          id: index.toString(),
          title: tokenData.title,
          icon: (
            <TokenIcon size="medium" symbol={tokenData.title.toLowerCase()} />
          ),
        };
      });
  }

  if (txnHistoryType === TXN_HISTORY_TYPE.LEVERAGED_VAULT) {
    currencyVaultData = accountHistory
      .filter(({ vaultName }) => vaultName)
      .map(({ underlying }, index) => ({
        id: index.toString(),
        title: underlying.symbol,
        icon: (
          <TokenIcon size="medium" symbol={underlying.symbol.toLowerCase()} />
        ),
      }));
    vaultNameData = accountHistory
      .filter(({ vaultName }) => vaultName)
      .map(({ vaultName }, index) => ({
        id: index.toString(),
        title: vaultName,
      }));
  }

  const removeDuplicateObjects = (data) => {
    const uniqueObjects = {};
    const filteredArray = data.filter(({ title }) => {
      if (!uniqueObjects[title]) {
        uniqueObjects[title] = true;
        return true;
      }
      return false;
    });

    return filteredArray;
  };

  const allCurrencyOptions =
    txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
      ? removeDuplicateObjects(currencyData)
      : removeDuplicateObjects(currencyVaultData);

  const allAssetOrVaultOptions =
    txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
      ? removeDuplicateObjects(assetData)
      : removeDuplicateObjects(vaultNameData);

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
