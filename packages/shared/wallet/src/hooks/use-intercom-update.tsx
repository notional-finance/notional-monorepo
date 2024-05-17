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
      const networkBalanceData = {};
      SupportedNetworks.forEach((network) => {
        const account = networkAccounts ? networkAccounts[network] : undefined;
        const usdBalance = account?.accountDefinition?.balances
          .filter((t) => t.symbol !== 'sNOTE')
          .reduce((sum, b) => sum + b.toFiat('USD').abs().toFloat(), 0);
        networkBalanceData[network] = usdBalance
          ? formatNumberAsAbbr(usdBalance)
          : '';
      });

      update({
        userId: selectedAccount,
        name: selectedAccount,
        customAttributes: networkBalanceData,
      });
    }
  }, [selectedAccount, isReadOnlyAddress, networkAccounts, update]);
};
