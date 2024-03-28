import { useState } from 'react';
import { CardContainer } from '../card-container/card-container';
import { FeatureLoader } from '../feature-loader/feature-loader';
import {
  useSelectedNetwork,
  useThemeVariant,
} from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useLocation } from 'react-router-dom';
import { ProductDashboard, DashboardViewProps } from '@notional-finance/mui';
import { META_TAG_CATEGORIES, PRODUCTS } from '@notional-finance/util';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
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
import MetaTagManager from '../meta-tag-manager/meta-tag-manager';

interface DashboardViewComponentProps extends DashboardViewProps {
  metaTagCategory: META_TAG_CATEGORIES;
}

export const DashboardView = ({
  gridData,
  listData,
  listColumns,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid,
  metaTagCategory,
}: DashboardViewComponentProps) => {
  const network = useSelectedNetwork();
  const themeVariant = useThemeVariant();
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
        <MetaTagManager metaTagCategory={metaTagCategory} />
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
      metaTagCategory={META_TAG_CATEGORIES.VAULTS_DASHBOARD}
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
      metaTagCategory={META_TAG_CATEGORIES.LIQUIDITY_LEVERAGED_DASHBOARD}
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
      metaTagCategory={META_TAG_CATEGORIES.LIQUIDITY_VARIABLE_DASHBOARD}
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
      metaTagCategory={META_TAG_CATEGORIES.LEND_VARIABLE_DASHBOARD}
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
      metaTagCategory={META_TAG_CATEGORIES.BORROW_VARIABLE_DASHBOARD}
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
      metaTagCategory={META_TAG_CATEGORIES.BORROW_FIXED_DASHBOARD}
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
      metaTagCategory={META_TAG_CATEGORIES.LEND_FIXED_DASHBOARD}
    />
  );
};

export default LiquidityLeveragedDashboard;
