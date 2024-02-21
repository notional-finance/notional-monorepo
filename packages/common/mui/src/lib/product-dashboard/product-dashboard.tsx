import { Box, styled, useTheme } from '@mui/material';
import { LeveragedDashboard, DashboardHeader } from './components';

export interface DashboardDataProps {
  title: string;
  subTitle: string;
  apy: number;
  symbol: string;
  routeCallback: () => void;
  bottomValue?: string;
  hasPosition?: boolean;
  incentiveValue?: string;
  incentiveSymbol?: string;
}

export interface LeveragedDashboardProps {
  productData?: {
    sectionTitle?: string;
    data: DashboardDataProps[];
    hasLeveragedPosition?: boolean;
    hasNegativePosition?: boolean;
  }[];
  showNegativeYields?: boolean;
  setShowNegativeYields?: (value: boolean) => void;
  isLoading?: boolean;
  threeWideGrid?: boolean;
}

export interface ProductDashboardProps {
  productData?: {
    sectionTitle?: string;
    data: DashboardDataProps[];
    hasLeveragedPosition?: boolean;
    hasNegativePosition?: boolean;
  }[];
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
  productData,
  headerData,
  showNegativeYields,
  setShowNegativeYields,
  threeWideGrid = true,
}: ProductDashboardProps) => {
  const theme = useTheme();
  const isLoading = productData && productData?.length === 0 ? true : false;
  return (
    <MainContainer sx={{ marginTop: isLoading ? theme.spacing(8.625) : '0px' }}>
      <DashboardHeader headerData={headerData} />
      <LeveragedDashboard
        productData={productData}
        isLoading={isLoading}
        showNegativeYields={showNegativeYields}
        setShowNegativeYields={setShowNegativeYields}
        threeWideGrid={threeWideGrid}
      />
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
