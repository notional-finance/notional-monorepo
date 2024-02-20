// import { Box } from '@mui/material';
import { useSelectedNetwork } from '@notional-finance/wallet';
import { CardContainer } from '../card-container/card-container';
import { FeatureLoader } from '../feature-loader/feature-loader';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { ProductDashboard } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useDashboardConfig } from './hooks';

export const DashboardView = () => {
  const network = useSelectedNetwork();
  const themeVariant = useThemeVariant();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { containerData, productDashboardData, headerData } =
    useDashboardConfig();

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={!!network && themeVariant ? true : false}>
        <CardContainer {...containerData}>
          <ProductDashboard {...productDashboardData} headerData={headerData} />
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
};

export default DashboardView;
