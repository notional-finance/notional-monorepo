import { useSelectedNetwork } from '@notional-finance/wallet';
import { CardContainer } from '../card-container/card-container';
import { FeatureLoader } from '../feature-loader/feature-loader';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useLocation } from 'react-router-dom';
import { ProductDashboard, DashboardViewProps } from '@notional-finance/mui';
import { PRODUCTS } from '@notional-finance/util';
import { ThemeProvider } from '@mui/material';
import {
  useDashboardConfig,
  useVaultDashboard,
  useLendFixedList,
  useLendFixedDashboard,
  useBorrowFixedDashboard,
  useLendVariableDashboard,
  useBorrowVariableDashboard,
  useLiquidityVariableDashboard,
  useLiquidityLeveragedDashboard,
} from './hooks';

export const DashboardView = ({
  gridData,
  listData,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid,
}: DashboardViewProps) => {
  const network = useSelectedNetwork();
  const themeVariant = useThemeVariant();
  const { pathname } = useLocation();
  const [_, routeKey] = pathname.split('/');
  const themeLanding = useNotionalTheme(themeVariant, 'product');
  const { containerData, headerData } = useDashboardConfig(
    routeKey as PRODUCTS
  );

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={!!network && themeVariant ? true : false}>
        <CardContainer {...containerData}>
          <ProductDashboard
            gridData={gridData || []}
            listData={listData}
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
  const gridData = useVaultDashboard(network);
  return <DashboardView {...gridData} threeWideGrid={false} />;
};

export const LiquidityLeveragedDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useLiquidityLeveragedDashboard(network);
  return <DashboardView {...gridData} />;
};

export const LiquidityVariableDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useLiquidityVariableDashboard(network);
  return <DashboardView {...gridData} />;
};

export const LendVariableDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useLendVariableDashboard(network);
  return <DashboardView {...gridData} />;
};

export const BorrowVariableDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useBorrowVariableDashboard(network);
  return <DashboardView {...gridData} />;
};

export const BorrowFixedDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useBorrowFixedDashboard(network);
  return <DashboardView {...gridData} />;
};

export const LendFixedDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useLendFixedDashboard(network);
  const listData = useLendFixedList(network);
  return <DashboardView {...gridData} listData={listData} />;
};

export default LiquidityLeveragedDashboard;
