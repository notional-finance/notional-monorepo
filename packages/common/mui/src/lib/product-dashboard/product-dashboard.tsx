import { Box, styled, useTheme } from '@mui/material';
import { DashboardGrid, DashboardHeader } from './components';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
// import { DataTable } from '../data-table/data-table';
import { DataTableColumn } from '../data-table/types';

export interface DashboardDataProps {
  title: string;
  subTitle: string;
  apy: number;
  symbol: string;
  routeCallback: () => void;
  bottomValue?: string;
  hasPosition?: boolean;
  apySubTitle?: MessageDescriptor;
  incentiveValue?: string;
  incentiveSymbols?: (string | undefined)[] | [];
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

export interface ProductDashboardProps {
  gridData?: {
    sectionTitle?: string;
    data: DashboardDataProps[];
    hasLeveragedPosition?: boolean;
    hasNegativePosition?: boolean;
  }[];
  listData?: {
    columns: Array<DataTableColumn>;
    data: Array<any>;
  };
  isLoading?: boolean;
  showNegativeYields?: boolean;
  setShowNegativeYields?: (value: boolean) => void;
  headerData: {
    toggleOptions: React.ReactNode[];
    messageBoxText: any;
  };
  threeWideGrid?: boolean;
}

export const ProductDashboard = ({
  gridData,
  // listData,
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
        <div>DATA TABLE</div>
        // <DataTable />
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
