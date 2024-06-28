import {
  useAllMarkets,
  useUserSettings,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage } from 'react-intl';

export function LendLeveragedCardView() {
  const { themeVariant } = useUserSettings();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const network = useSelectedNetwork();
  const {
    yields: { leveragedLend },
  } = useAllMarkets(network);
  const heading = defineMessage({
    defaultMessage: 'Leveraged Lending',
    description: 'page heading',
  });

  const subtitle = defineMessage({
    defaultMessage: `Arbitrage Notional's interest rates by borrowing at a low rate and lending at a higher one with leverage for maximum returns.
    `,
    description: 'page subtitle',
  });

  const docsText = defineMessage({
    defaultMessage: 'Read leveraged lending docs',
    description: 'docs link',
  });

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader
        featureLoaded={leveragedLend?.length > 0 && themeVariant ? true : false}
      >
        <CardContainer
          heading={heading}
          subtitle={subtitle}
          linkText={docsText}
          leveraged={true}
          docsLink="https://docs.notional.finance/notional-v3/product-guides/leveraged-lending"
        ></CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
}

export default LendLeveragedCardView;
