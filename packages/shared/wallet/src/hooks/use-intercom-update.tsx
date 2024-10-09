import { useNotionalContext } from '@notional-finance/notionable-hooks';
import {
  getFromLocalStorage,
  getNowSeconds,
  ONE_WEEK,
  setInLocalStorage,
  SupportedNetworks,
} from '@notional-finance/util';
import { useIntercom } from 'react-use-intercom';
import { useCallback, useEffect, useState } from 'react';

const DeBankAPIKey = process.env['NX_DEBANK_API_KEY'] as string | undefined;

async function fetchDeBankNetWorth(walletAddress) {
  const url = `https://pro-openapi.debank.com/v1/user/total_balance?id=${walletAddress}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        AccessKey: DeBankAPIKey || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();

    return data.total_usd_value;
  } catch (error) {
    console.error('Failed to fetch DeBank net worth:', error);
  }
}

export const useIntercomUpdate = () => {
  const { update } = useIntercom();
  const userSettings = getFromLocalStorage('userSettings');
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(0);
  const {
    globalState: { networkAccounts, wallet },
  } = useNotionalContext();
  const isReadOnlyAddress = wallet?.isReadOnlyAddress;
  const selectedAccount = wallet?.selectedAddress;

  const newDeBankWallet = !userSettings.debankAddress;

  const updateDeBankWallet =
    userSettings.debankAddress &&
    !isReadOnlyAddress &&
    userSettings.debankAddress !== selectedAccount;

  const weeklyCheck = (() => {
    if (userSettings.debankTimestamp) {
      const lastUpdateDate = new Date(userSettings.debankTimestamp);
      const currentDate = getNowSeconds();
      const lastUpdateSeconds = Math.floor(lastUpdateDate.getTime() / 1000);
      return currentDate - lastUpdateSeconds > ONE_WEEK;
    }
    return false;
  })();

  const [isFetching, setIsFetching] = useState(false);

  const debouncedFetchDeBankNetWorth = useCallback(
    async (address: string) => {
      if (isFetching) return;
      setIsFetching(true);
      try {
        const netWorth = await fetchDeBankNetWorth(address);
        const currentTimestamp = getNowSeconds();
        setCurrentNetWorth(Math.trunc(netWorth));
        setInLocalStorage('userSettings', {
          ...userSettings,
          debankAddress: address,
          debankNetWorth: Math.trunc(netWorth),
          debankTimestamp: currentTimestamp,
        });
      } finally {
        setIsFetching(false);
      }
    },
    [isFetching, userSettings]
  );

  useEffect(() => {
    if (selectedAccount && !isReadOnlyAddress) {
      const balanceData = {
        walletBalance: 0,
        notionalBalance: 0,
      };

      if (newDeBankWallet || updateDeBankWallet || weeklyCheck) {
        debouncedFetchDeBankNetWorth(selectedAccount);
      }

      SupportedNetworks.forEach((network) => {
        const account = networkAccounts ? networkAccounts[network] : undefined;

        const walletBalance = account?.accountDefinition?.balances
          .filter((b) => b.tokenType === 'Underlying' && b.symbol !== 'sNOTE')
          .reduce((acc, b) => acc + b.toFiat('USD').toFloat(), 0);

        const notionalBalance = account?.accountDefinition?.balances
          .filter((b) => b.tokenType !== 'Underlying' && b.symbol !== 'sNOTE')
          .reduce((acc, b) => acc + b.toFiat('USD').toFloat(), 0);

        if (walletBalance) {
          balanceData.walletBalance = balanceData.walletBalance + walletBalance;
        }

        if (notionalBalance) {
          balanceData.notionalBalance =
            balanceData.notionalBalance + notionalBalance;
        }
      });

      const totalBalance =
        balanceData.notionalBalance + balanceData.walletBalance;

      update({
        userId: selectedAccount,
        name: selectedAccount,
        customAttributes: {
          TotalWalletBalance: balanceData.walletBalance,
          TotalNotionalBalance: balanceData.notionalBalance,
          TotalBalance: totalBalance,
          DeBankNetWorth: !userSettings.debankNetWorth
            ? Math.trunc(currentNetWorth)
            : userSettings.debankNetWorth,
        },
      });
    }
  }, [
    selectedAccount,
    isReadOnlyAddress,
    networkAccounts,
    update,
    currentNetWorth,
    userSettings.debankNetWorth,
    newDeBankWallet,
    updateDeBankWallet,
    weeklyCheck,
  ]);
};
