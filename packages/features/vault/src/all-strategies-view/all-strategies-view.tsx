import { useStrategies } from './use-strategies';
import { CardContainer } from '@notional-finance/shared-web';
import { CardVariant } from '@notional-finance/mui';
import { defineMessage, FormattedMessage } from 'react-intl';

export const AllStrategyView = () => {
  const allVaults = useStrategies();
  const cards =
    allVaults?.map((v) => {
      const {
        minDepositRequired,
        vaultAddress,
        underlyingSymbol,
        headlineRate,
        vaultName,
        capacityUsedPercentage,
        capacityRemaining,
      } = v;
      return (
        <CardVariant
          variant="vault"
          vaultName={vaultName}
          symbol={underlyingSymbol}
          rate={headlineRate || 0}
          minDepositRequired={minDepositRequired}
          route={`/vaults/${vaultAddress}`}
          buttonText={<FormattedMessage defaultMessage="Enter Vault" />}
          capacityUsedPercentage={capacityUsedPercentage}
          capacityRemaining={capacityRemaining}
        />
      );
    }) || [];

  return (
    <CardContainer
      heading={defineMessage({
        defaultMessage: 'Leveraged Vaults',
        description: 'page heading',
      })}
      subtitle={defineMessage({
        defaultMessage:
          "Boost your returns with leveraged yield strategies and fixed borrowing costs. Borrow at a fixed rate from Notional's liquidity pools and deposit into select DeFi yield strategies. All in one click.",
        description: 'page heading subtitle',
      })}
      cards={cards}
      videoId={'vkaPi1s5aeI'}
    />
  );
};

export default AllStrategyView;
