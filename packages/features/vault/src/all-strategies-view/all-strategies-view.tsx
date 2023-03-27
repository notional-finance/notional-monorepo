import { useStrategies } from './use-strategies';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { Vault } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';

export const AllStrategyView = () => {
  const allVaults = useStrategies();
  const themeLanding = useNotionalTheme(THEME_VARIANTS.LIGHT, 'landing');

  return (
    <ThemeProvider theme={themeLanding}>
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
      >
        {allVaults?.map((v) => {
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
            <Vault
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
        })}
      </CardContainer>
    </ThemeProvider>
  );
};

export default AllStrategyView;
