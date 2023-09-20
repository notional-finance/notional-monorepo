import { useStrategies } from './use-strategies';
import { CardContainer } from '@notional-finance/shared-web';
import { Vault, FeatureLoader } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { ThemeProvider } from '@mui/material';

export const AllStrategyView = () => {
  const allVaults = useStrategies();
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={!!allVaults}>
        <CardContainer
          heading={defineMessage({
            defaultMessage: 'Leveraged Vaults',
            description: 'page heading',
          })}
          subtitle={defineMessage({
            defaultMessage: `Get one-click access to sophisticated DeFi yield strategies and dial up your leverage for maximum efficiency.`,
            description: 'page heading subtitle',
          })}
          linkText={defineMessage({
            defaultMessage: 'New Vaults Coming Soon on Notional V3',
            description: 'docs link',
          })}
          docsLink="https://docs.notional.finance/notional-v3"
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
                key={vaultAddress}
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
          }) || []}
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
};

export default AllStrategyView;
