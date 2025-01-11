import { useState } from 'react';
import { CardContainer } from '../card-container/card-container';
import FeatureLoader from '../feature-loader/feature-loader';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useLocation, useParams } from 'react-router-dom';
import {
  ProductDashboard,
  DashboardViewProps,
  MobileProductDashboard,
} from '@notional-finance/mui';
import { PRODUCTS } from '@notional-finance/util';
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
  useLeveragedVaultGrid,
  useLeverageVaultList,
  useLiquidityVariableGrid,
  useLiquidityLeveragedGrid,
  useLiquidityVariableList,
} from './hooks';
import { sortGridData, sortListData } from './hooks/utils';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { useProductModal } from '../hooks';
import { FormattedMessage } from 'react-intl';
import { useLiquidityLeveragedList } from './hooks/use-liquidity-leveraged-list';

const mobileTitles = {
  [PRODUCTS.LEND_FIXED]: (
    <FormattedMessage defaultMessage="Fixed Rate Lending" />
  ),
  [PRODUCTS.LEND_VARIABLE]: <FormattedMessage defaultMessage="Lending" />,
  [PRODUCTS.LIQUIDITY_VARIABLE]: (
    <FormattedMessage defaultMessage="Provide Liquidity" />
  ),
  [PRODUCTS.BORROW_FIXED]: (
    <FormattedMessage defaultMessage="Fixed Rate Borrowing" />
  ),
  [PRODUCTS.BORROW_VARIABLE]: <FormattedMessage defaultMessage="Borrowing" />,
  [PRODUCTS.LIQUIDITY_LEVERAGED]: (
    <FormattedMessage defaultMessage="Leveraged Liquidity" />
  ),
  [PRODUCTS.LEVERAGED_POINTS_FARMING]: (
    <FormattedMessage defaultMessage="Leveraged Points Farming" />
  ),
  [PRODUCTS.LEVERAGED_YIELD_FARMING]: (
    <FormattedMessage defaultMessage="Leveraged Yield Farming" />
  ),
  [PRODUCTS.LEVERAGED_PENDLE]: (
    <FormattedMessage defaultMessage="Leveraged Pendle" />
  ),
};

export const DashboardView = ({
  gridData,
  listData,
  listColumns,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid,
  ComingSoonComponent,
}: DashboardViewProps) => {
  const network = useSelectedNetwork();
  const { themeVariant } = useAppStore();
  const { pathname } = useLocation();
  const [_, routeKey] = pathname.split('/');
  const userSettings = getFromLocalStorage('userSettings');
  const productModalContent = useProductModal();
  const [tokenGroup, setTokenGroup] = useState<number>(
    userSettings.tokenGroup || 0
  );
  const [reinvestmentType, setReinvestmentType] = useState<number>(0);
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

  const handleReinvestmentType = (value: number) => {
    setReinvestmentType(value);
  };

  const sortedGridData =
    routeKey === PRODUCTS.LEVERAGED_YIELD_FARMING && gridData
      ? sortGridData(gridData, reinvestmentType)
      : gridData;
  const modalContent = productModalContent[routeKey];

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={!!network && themeVariant ? true : false}>
        <CardContainer {...containerData}>
          <ProductDashboard
            gridData={sortedGridData || []}
            listColumns={listColumns}
            listData={sortListData(
              listData,
              tokenGroup,
              reinvestmentType,
              routeKey as PRODUCTS
            )}
            ComingSoonComponent={ComingSoonComponent}
            setShowNegativeYields={setShowNegativeYields}
            showNegativeYields={showNegativeYields}
            headerData={headerData}
            threeWideGrid={threeWideGrid}
            tokenGroup={tokenGroup}
            handleTokenGroup={handleTokenGroup}
            reinvestmentType={reinvestmentType}
            handleReinvestmentType={handleReinvestmentType}
            dashboardTab={dashboardTab}
            handleDashboardTab={handleDashboardTab}
          />
          <MobileProductDashboard
            gridData={sortedGridData || []}
            showNegativeYields={showNegativeYields}
            setShowNegativeYields={setShowNegativeYields}
            modalContent={modalContent}
            mobileTitle={mobileTitles[routeKey as PRODUCTS]}
            routeKey={routeKey}
          />
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
};

export const LeveragedVaultDashboard = () => {
  const network = useSelectedNetwork();
  const { selectedProduct } = useParams();
  const gridData = useLeveragedVaultGrid(network, selectedProduct as PRODUCTS);
  const { listColumns, listData } = useLeverageVaultList(
    network,
    selectedProduct as PRODUCTS
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
  const { listColumns, listData } = useLiquidityLeveragedList(network);

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
  const { listColumns, listData } = useLiquidityVariableList(network);
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
  const gridData = useVariableRateGrid(PRODUCTS.LEND_VARIABLE);
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
  const gridData = useVariableRateGrid(PRODUCTS.BORROW_VARIABLE);
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
