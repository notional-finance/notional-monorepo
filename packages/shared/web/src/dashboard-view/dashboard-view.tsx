import { useState } from 'react';
import { CardContainer } from '../card-container/card-container';
import { FeatureLoader } from '../feature-loader/feature-loader';
import { useSelectedNetwork, useThemeVariant } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useLocation } from 'react-router-dom';
import { ProductDashboard, DashboardViewProps } from '@notional-finance/mui';
import { PRODUCTS } from '@notional-finance/util';
import { ThemeProvider } from '@mui/material';
import {
  useVaultList,
  useVaultGrid,
  useFixedRateGrid,
  useVariableRateGrid,
  useDashboardConfig,
  useLendBorrowList,
  useLiquidityList,
  useLiquidityVariableGrid,
  useLiquidityLeveragedGrid,
} from './hooks';
import { sortListData } from './hooks/utils';

export const DashboardView = ({
  gridData,
  listData,
  listColumns,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid,
}: DashboardViewProps) => {
  const network = useSelectedNetwork();
  const themeVariant = useThemeVariant();
  const { pathname } = useLocation();
  const [_, routeKey] = pathname.split('/');
  const [tokenGroup, setTokenGroup] = useState<number>(0);
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
            listColumns={listColumns}
            listData={sortListData(listData, tokenGroup)}
            setShowNegativeYields={setShowNegativeYields}
            showNegativeYields={showNegativeYields}
            headerData={headerData}
            threeWideGrid={threeWideGrid}
            tokenGroup={tokenGroup}
            setTokenGroup={setTokenGroup}
          />
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
};

export const VaultDashboard = () => {
  const network = useSelectedNetwork();
  const gridData = useVaultGrid(network);
  const { listColumns, listData } = useVaultList(network);
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

export const LendVariableDashboard = () => {
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
};

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
