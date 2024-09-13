import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { SupportedNetworks } from '@notional-finance/util';
import { useIntercom } from 'react-use-intercom';
import { useEffect } from 'react';
import { useAppStore } from '@notional-finance/notionable';

export const useIntercomUpdate = () => {
  const { update } = useIntercom();
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  const {
    wallet: { userWallet },
  } = useAppStore();
  const isReadOnlyAddress = userWallet?.isReadOnlyAddress;
  const selectedAccount = userWallet?.selectedAddress;

  useEffect(() => {
    if (selectedAccount && !isReadOnlyAddress) {
      const balanceData = {
        walletBalance: 0,
        notionalBalance: 0,
      };
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
        },
      });
    }
  }, [selectedAccount, isReadOnlyAddress, networkAccounts, update]);
};
