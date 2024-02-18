import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { useSelectedNetwork } from '@notional-finance/wallet';
import { ProductDashboard } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { defineMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';
import { useVaultCards } from './hooks';

export const VaultCardView = () => {
  const themeVariant = useThemeVariant();
  // TODO: this needs to be linked up to the selector
  const network = useSelectedNetwork();
  const { productData, headerData, setShowNegativeYields, showNegativeYields } =
    useVaultCards(network);
  const themeLanding = useNotionalTheme(themeVariant, 'landing');

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={!!network && themeVariant ? true : false}>
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
          <ProductDashboard
            productData={productData}
            headerData={headerData}
            setShowNegativeYields={setShowNegativeYields}
            showNegativeYields={showNegativeYields}
          />
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
};
