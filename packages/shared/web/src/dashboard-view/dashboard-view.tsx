import { useState } from 'react';
import { CardContainer } from '../card-container/card-container';
import FeatureLoader from '../feature-loader/feature-loader';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useLocation } from 'react-router-dom';
import { ProductDashboard, DashboardViewProps } from '@notional-finance/mui';
import { PRODUCTS, VAULT_TYPES } from '@notional-finance/util';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { ThemeProvider } from '@mui/material';
import {
  useFixedRateGrid,
  useVariableRateGrid,
  useDashboardConfig,
  useLendBorrowList,
  useLiquidityList,
  useLeveragedFarmingGrid,
  useLeverageFarmingList,
  useLiquidityVariableGrid,
  useLiquidityLeveragedGrid,
} from './hooks';
import { sortListData } from './hooks/utils';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@notional-finance/notionable';

export const DashboardView = ({
  gridData,
  listData,
  listColumns,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid,
}: DashboardViewProps) => {
  const network = useSelectedNetwork();
  const { themeVariant } = useAppStore();
  const { pathname } = useLocation();
  const [_, routeKey] = pathname.split('/');
  const userSettings = getFromLocalStorage('userSettings');
  const [tokenGroup, setTokenGroup] = useState<number>(
    userSettings.tokenGroup || 0
  );
  const themeLanding = useNotionalTheme(themeVariant, 'product');
  const [dashboardTab, setDashboardTab] = useState<number>(
    userSettings.dashboardTab || 0
  );
  const { containerData, headerData } = useDashboardConfig(
    routeKey as PRODUCTS
  );

  const handleDashboardTab = (value: number) => {
    setDashboardTab(value);
    setInLocalStorage('userSettings', {
      ...userSettings,
      dashboardTab: value,
    });
  };

  const handleTokenGroup = (value: number) => {
    setTokenGroup(value);
    setInLocalStorage('userSettings', {
      ...userSettings,
      tokenGroup: value,
    });
  };

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={!!network && themeVariant ? true : false}>
        <CardContainer {...containerData}>
          <ProductDashboard
            gridData={gridData || []}
            listColumns={listColumns}
            listData={sortListData(listData, tokenGroup)}
            setShowNegativeYields={setShowNegativeYields}
            showNegativeYields={showNegativeYields}
            headerData={headerData}
            threeWideGrid={threeWideGrid}
            tokenGroup={tokenGroup}
            handleTokenGroup={handleTokenGroup}
            dashboardTab={dashboardTab}
            handleDashboardTab={handleDashboardTab}
          />
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
};

export const LeveragedPointsDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useLeveragedFarmingGrid(
    network,
    VAULT_TYPES.LEVERAGED_POINTS_FARMING
  );
  const { listColumns, listData } = useLeverageFarmingList(
    network,
    VAULT_TYPES.LEVERAGED_POINTS_FARMING
  );
  return (
    <DashboardView
      {...gridData}
      listColumns={listColumns}
      listData={listData}
      threeWideGrid={false}
    />
  );
};

export const LeveragedYieldDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useLeveragedFarmingGrid(
    network,
    VAULT_TYPES.LEVERAGED_YIELD_FARMING
  );
  const { listColumns, listData } = useLeverageFarmingList(
    network,
    VAULT_TYPES.LEVERAGED_YIELD_FARMING
  );

  return (
    <DashboardView
      {...gridData}
      listColumns={listColumns}
      listData={listData}
      threeWideGrid={false}
    />
  );
};

export const LiquidityLeveragedDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useLiquidityLeveragedGrid(network);
  const { listColumns, listData } = useLiquidityList(
    PRODUCTS.LIQUIDITY_LEVERAGED,
    network
  );

  return (
    <DashboardView
      {...gridData}
      listColumns={listColumns}
      listData={listData}
    />
  );
};

export const LiquidityVariableDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useLiquidityVariableGrid(network);
  const { listColumns, listData } = useLiquidityList(
    PRODUCTS.LIQUIDITY_VARIABLE,
    network
  );
  return (
    <DashboardView
      {...gridData}
      listColumns={listColumns}
      listData={listData}
    />
  );
};

export const LendVariableDashboard = observer(() => {
  const network = useSelectedNetwork();
  const gridData = useVariableRateGrid(network, PRODUCTS.LEND_VARIABLE);
  const { listColumns, listData } = useLendBorrowList(
    PRODUCTS.LEND_VARIABLE,
    network
  );
  return (
    <DashboardView
      {...gridData}
      listColumns={listColumns}
      listData={listData}
    />
  );
});

export const BorrowVariableDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useVariableRateGrid(network, PRODUCTS.BORROW_VARIABLE);
  const { listColumns, listData } = useLendBorrowList(
    PRODUCTS.BORROW_VARIABLE,
    network
  );
  return (
    <DashboardView
      {...gridData}
      listColumns={listColumns}
      listData={listData}
    />
  );
};

export const BorrowFixedDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useFixedRateGrid(network, PRODUCTS.BORROW_FIXED);
  const { listColumns, listData } = useLendBorrowList(
    PRODUCTS.BORROW_FIXED,
    network
  );

  return (
    <DashboardView
      {...gridData}
      listColumns={listColumns}
      listData={listData}
    />
  );
};

export const LendFixedDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useFixedRateGrid(network, PRODUCTS.LEND_FIXED);
  const { listColumns, listData } = useLendBorrowList(
    PRODUCTS.LEND_FIXED,
    network
  );
  return (
    <DashboardView
      {...gridData}
      listColumns={listColumns}
      listData={listData}
    />
  );
};

export default LiquidityLeveragedDashboard;
