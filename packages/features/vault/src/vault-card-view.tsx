import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { Vault } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';
import { useVaultCards } from './hooks';

export const VaultCardView = () => {
  const themeVariant = useThemeVariant();
  const allVaults = useVaultCards();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader
        featureLoaded={allVaults?.length > 0 && themeVariant ? true : false}
      >
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
          leveraged={true}
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
