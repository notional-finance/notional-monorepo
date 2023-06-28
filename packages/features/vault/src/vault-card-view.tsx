import { CardContainer } from '@notional-finance/shared-web';
import { Vault, FeatureLoader } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { ThemeProvider } from '@mui/material';
import { useVaultCards } from './hooks';

export const VaultCardView = () => {
  const allVaults = useVaultCards();
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={allVaults?.length > 0}>
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
            defaultMessage: 'Read leveraged vault docs',
            description: 'docs link',
          })}
          docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/leveraged-vaults"
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
          })}
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
};
