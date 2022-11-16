import { useStrategies } from './use-strategies';
import { CardVariant, CardContainer } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';

export const AllStrategyView = () => {
  const allVaults = useStrategies();
  const cards =
    allVaults?.map((v) => {
      const {
        minDepositRequired,
        vaultAddress,
        underlyingSymbol,
        headlineRate,
        strategyName,
        capacityUsedPercentage,
        capacityRemaining,
      } = v;
      return (
        <CardVariant
          variant="vault"
          strategy={strategyName}
          symbol={underlyingSymbol}
          rate={headlineRate || 0}
          minDepositRequired={minDepositRequired}
          route={`/vaults/${vaultAddress}`}
          buttonText={'Enter Vault'}
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
    />
  );
};

export default AllStrategyView;
