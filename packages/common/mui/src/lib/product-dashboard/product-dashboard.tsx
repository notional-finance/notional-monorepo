import { Box, styled, useTheme } from '@mui/material';
import { DashboardGrid, DashboardHeader } from './components';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { DataTable } from '../data-table/data-table';
import { DataTableColumn, TABLE_VARIANTS } from '../data-table/types';
import { Network } from '@notional-finance/util';

export interface DashboardDataProps {
  title: string;
  subTitle: string;
  apy: number;
  symbol: string;
  network: Network;
  routeCallback: () => void;
  bottomValue?: string;
  hasPosition?: boolean;
  apySubTitle?: MessageDescriptor;
  incentiveValue?: string;
  incentiveSymbols?: (string | undefined)[] | [];
}

export interface DashboardHeaderProps {
  headerData: {
    toggleOptions: React.ReactNode[];
    messageBoxText?: JSX.Element | MessageDescriptor;
    networkToggle: number;
    handleNetWorkToggle: (value: number) => void;
  };
  dashboardTab: number;
  setDashboardTab: (value: number) => void;
  tokenGroup: number;
  setTokenGroup: (value: number) => void;
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
  setTokenGroup: (value: number) => void;
  headerData: {
    toggleOptions: React.ReactNode[];
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
  setTokenGroup,
  headerData,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid = true,
}: ProductDashboardProps) => {
  const theme = useTheme();
  const [dashboardTab, setDashboardTab] = useState<number>(0);
  const isLoading = gridData && gridData?.length === 0 ? true : false;

  return (
    <MainContainer sx={{ marginTop: isLoading ? theme.spacing(8.625) : '0px' }}>
      <DashboardHeader
        headerData={headerData}
        tokenGroup={tokenGroup}
        setTokenGroup={setTokenGroup}
        dashboardTab={dashboardTab}
        setDashboardTab={setDashboardTab}
      />
      {dashboardTab === 0 ? (
        <DashboardGrid
          gridData={gridData}
          isLoading={isLoading}
          showNegativeYields={showNegativeYields}
          setShowNegativeYields={setShowNegativeYields}
          threeWideGrid={threeWideGrid}
        />
      ) : (
        listColumns && (
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
