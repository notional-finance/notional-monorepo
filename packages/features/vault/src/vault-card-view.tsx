import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { Vault } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { defineMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';
import { useVaultCards } from './hooks';
import { Network } from '@notional-finance/util';

export const VaultCardView = () => {
  const themeVariant = useThemeVariant();
  // TODO: this needs to be linked up to the selector
  const network = Network.ArbitrumOne;
  const allVaults = useVaultCards(network);
  const themeLanding = useNotionalTheme(themeVariant, 'landing');

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader
        featureLoaded={
          !!network && allVaults?.length > 0 && themeVariant ? true : false
        }
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
          docsLink="https://docs.notional.finance/notional-v3/product-guides/leveraged-vaults"
          leveraged={true}
        >
          {allVaults?.map((v) => {
            const {
              minDepositRequired,
              vaultAddress,
              underlyingSymbol,
              hasPosition,
              headlineRate,
              netWorth,
              vaultName,
              capacityUsedPercentage,
              capacityRemaining,
              leverage,
              VaultCardOverlay,
              VaultCardIcon,
            } = v;
            return (
              <Vault
                VaultCardOverlay={VaultCardOverlay}
                VaultCardIcon={VaultCardIcon}
                key={vaultAddress}
                hasVaultPosition={hasPosition}
                vaultName={vaultName}
                symbol={underlyingSymbol}
                rate={headlineRate || 0}
                leverage={leverage}
                netWorth={netWorth}
                minDepositRequired={minDepositRequired}
                route={`/vaults/${vaultAddress}`}
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
