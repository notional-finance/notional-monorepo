import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { SupportedNetworks } from '@notional-finance/util';
import { useIntercom } from 'react-use-intercom';
import { useEffect } from 'react';

export const useIntercomUpdate = () => {
  const { update } = useIntercom();
  const {
    globalState: { networkAccounts, wallet },
  } = useNotionalContext();
  const isReadOnlyAddress = wallet?.isReadOnlyAddress;
  const selectedAccount = wallet?.selectedAddress;

  useEffect(() => {
    if (selectedAccount && !isReadOnlyAddress) {
      const balanceData = {};
      SupportedNetworks.forEach((network) => {
        const account = networkAccounts ? networkAccounts[network] : undefined;

        const walletBalance = account?.accountDefinition?.balances
          .filter((b) => b.tokenType === 'Underlying')
          .reduce((acc, b) => acc + b.toFiat('USD').toFloat(), 0);

        const notionalBalance = account?.accountDefinition?.balances
          .filter((b) => b.tokenType !== 'Underlying')
          .reduce((acc, b) => acc + b.toFiat('USD').toFloat(), 0);

        balanceData[network] = {
          walletBalance: walletBalance || 0,
          notionalBalance: notionalBalance || 0,
        };
      });

      const totalWalletBalance =
        balanceData['mainnet'].walletBalance +
        balanceData['arbitrum'].walletBalance;

      const totalNotionalBalance =
        balanceData['mainnet'].notionalBalance +
        balanceData['arbitrum'].notionalBalance;

      const totalBalance = totalWalletBalance + totalNotionalBalance;

      update({
        userId: selectedAccount,
        name: selectedAccount,
        customAttributes: {
          TotalWalletBalance: formatNumberAsAbbr(totalWalletBalance, 2),
          TotalNotionalBalance: formatNumberAsAbbr(totalNotionalBalance, 2),
          TotalBalance: formatNumberAsAbbr(totalBalance, 2),
        },
      });
    }
  }, [selectedAccount, isReadOnlyAddress, networkAccounts, update]);
};
