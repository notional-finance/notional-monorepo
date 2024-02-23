import { useSelectedNetwork } from '@notional-finance/wallet';
import { CardContainer } from '../card-container/card-container';
import { FeatureLoader } from '../feature-loader/feature-loader';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useLocation } from 'react-router-dom';
import { ProductDashboard, DashboardGridProps } from '@notional-finance/mui';
import { PRODUCTS } from '@notional-finance/util';
import { ThemeProvider } from '@mui/material';
import {
  useDashboardConfig,
  useVaultDashboard,
  useLendFixedDashboard,
  useBorrowFixedDashboard,
  useLendVariableDashboard,
  useBorrowVariableDashboard,
  useLiquidityVariableDashboard,
  useLiquidityLeveragedDashboard,
} from './hooks';

export const DashboardView = ({
  productData,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid,
}: DashboardGridProps) => {
  const network = useSelectedNetwork();
  const themeVariant = useThemeVariant();
  const { pathname } = useLocation();
  const [_, routeKey] = pathname.split('/');
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { containerData, headerData } = useDashboardConfig(
    routeKey as PRODUCTS
  );

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

export const LiquidityVariableDashboard = () => {
  const network = useSelectedNetwork();
  const productData = useLiquidityVariableDashboard(network);
  return <DashboardView {...productData} />;
};

export const LendVariableDashboard = () => {
  const network = useSelectedNetwork();
  const productData = useLendVariableDashboard(network);
  return <DashboardView {...productData} />;
};

export const BorrowVariableDashboard = () => {
  const network = useSelectedNetwork();
  const productData = useBorrowVariableDashboard(network);
  return <DashboardView {...productData} />;
};

export const BorrowFixedDashboard = () => {
  const network = useSelectedNetwork();
  const productData = useBorrowFixedDashboard(network);
  return <DashboardView {...productData} />;
};

export const LendFixedDashboard = () => {
  const network = useSelectedNetwork();
  const productData = useLendFixedDashboard(network);
  return <DashboardView {...productData} />;
};

export default LiquidityLeveragedDashboard;
