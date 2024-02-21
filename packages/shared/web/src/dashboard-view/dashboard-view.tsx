import { useSelectedNetwork } from '@notional-finance/wallet';
import { CardContainer } from '../card-container/card-container';
import { FeatureLoader } from '../feature-loader/feature-loader';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useLocation } from 'react-router-dom';
import {
  ProductDashboard,
  LeveragedDashboardProps,
} from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import {
  useDashboardConfig,
  useVaultDashboard,
  useLiquidityLeveragedDashboard,
} from './hooks';

export const DashboardView = ({
  productData,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid,
}: LeveragedDashboardProps) => {
  const network = useSelectedNetwork();
  const themeVariant = useThemeVariant();
  const { pathname } = useLocation();
  const [_, routeKey] = pathname.split('/');
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { containerData, headerData } = useDashboardConfig(routeKey);

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={!!network && themeVariant ? true : false}>
        <CardContainer {...containerData}>
          <ProductDashboard
            productData={productData || []}
            setShowNegativeYields={setShowNegativeYields}
            showNegativeYields={showNegativeYields}
            headerData={headerData}
            threeWideGrid={threeWideGrid}
          />
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
};

export const VaultDashboard = () => {
  const network = useSelectedNetwork();
  const productData = useVaultDashboard(network);
  return <DashboardView {...productData} threeWideGrid={false} />;
};

export const LiquidityLeveragedDashboard = () => {
  const network = useSelectedNetwork();
  const productData = useLiquidityLeveragedDashboard(network);
  return <DashboardView {...productData} />;
};

export default LiquidityLeveragedDashboard;
