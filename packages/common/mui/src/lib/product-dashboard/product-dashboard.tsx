import { Box, styled, useTheme } from '@mui/material';
import {
  DashboardGrid,
  DashboardHeader,
  DashboardStateZero,
} from './components';
import { MessageDescriptor } from 'react-intl';
import { DataTable } from '../data-table/data-table';
import ProgressIndicator from '../progress-indicator/progress-indicator';
import { DataTableColumn, TABLE_VARIANTS } from '../data-table/types';
import { Network, VAULT_TYPES } from '@notional-finance/util';
import { ReactNode } from 'react';

export interface DashboardDataProps {
  title: string;
  subTitle: string;
  apy: number;
  symbol: string;
  network: Network;
  routeCallback: () => void;
  bottomLeftValue?: string | ReactNode;
  bottomRightValue?: string | ReactNode;
  hasPosition?: boolean;
  apySubTitle?: MessageDescriptor;
  incentiveValue?: string;
  incentiveSymbols?: (string | undefined)[] | [];
}

export interface DashboardHeaderProps {
  headerData: {
    messageBoxText?: JSX.Element | MessageDescriptor;
    networkToggle: number;
    handleNetWorkToggle: (value: number) => void;
  };
  tokenGroup: number;
  handleTokenGroup: (value: number) => void;
  dashboardTab: number;
  handleDashboardTab: (value: number) => void;
}

export interface DashboardGridProps {
  gridData?: {
    sectionTitle?: string;
    data: DashboardDataProps[];
    hasLeveragedPosition?: boolean;
    hasNegativePosition?: boolean;
  }[];
  showNegativeYields?: boolean;
  setShowNegativeYields?: (value: boolean) => void;
  isLoading?: boolean;
  threeWideGrid?: boolean;
  hideApyTitle?: boolean;
}
export interface DashboardViewProps extends DashboardGridProps {
  listData: Array<any>;
  listColumns: Array<DataTableColumn>;
}

export interface ProductDashboardProps extends DashboardViewProps {
  tokenGroup: number;
  handleTokenGroup: (value: number) => void;
  dashboardTab: number;
  handleDashboardTab: (value: number) => void;
  headerData: {
    messageBoxText: JSX.Element | MessageDescriptor;
    networkToggle: number;
    handleNetWorkToggle: (value: number) => void;
  };
}

export const ProductDashboard = ({
  gridData,
  listData,
  listColumns,
  tokenGroup,
  handleTokenGroup,
  headerData,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid = true,
  dashboardTab,
  handleDashboardTab,
}: ProductDashboardProps) => {
  const theme = useTheme();
  const isLoading = gridData && gridData?.length === 0 ? true : false;
  const noDataAvailable =
    gridData && gridData[0]?.data.length === 0 && listData.length === 0
      ? true
      : false;

  return (
    <MainContainer sx={{ marginTop: isLoading ? theme.spacing(8.625) : '0px' }}>
      <DashboardHeader
        headerData={headerData}
        tokenGroup={tokenGroup}
        handleTokenGroup={handleTokenGroup}
        dashboardTab={dashboardTab}
        handleDashboardTab={handleDashboardTab}
      />
      {isLoading ? (
        <ProgressIndicator
          type="notional"
          sx={{ height: theme.spacing(57.5) }}
        />
      ) : noDataAvailable ? (
        <DashboardStateZero />
      ) : dashboardTab === 0 ? (
        <DashboardGrid
          gridData={gridData}
          isLoading={isLoading}
          showNegativeYields={showNegativeYields}
          setShowNegativeYields={setShowNegativeYields}
          threeWideGrid={threeWideGrid}
        />
      ) : (
        dashboardTab === 1 && (
          <Box
            sx={{
              marginTop: theme.spacing(4),
              marginBottom: theme.spacing(0.5),
            }}
          >
            <DataTable
              columns={listColumns}
              data={listData}
              tableVariant={TABLE_VARIANTS.SORTABLE}
              sx={{ border: 'none', borderRadius: '6px' }}
            />
          </Box>
        )
      )}
    </MainContainer>
  );
};

const MainContainer = styled(Box)(
  ({ theme }) => `
    max-width: ${theme.spacing(160)};
    width: 100%;
    background: ${theme.palette.background.paper};
    border-radius: 12px;
    border: ${theme.shape.borderStandard};
    box-shadow: 0px 30px 54px -15px rgba(20, 42, 74, 0.30);
    margin: ${theme.spacing(6)};
    ${theme.breakpoints.down('sm')} {
      margin: 0px;
    }
      `
);

export default ProductDashboard;
