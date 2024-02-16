import { Box, styled, useTheme } from '@mui/material';
import { LeveragedDashboard, DashboardHeader } from './components';

export interface DashboardDataProps {
  title: string;
  apy?: string;
  tvl: string;
  symbol: string;
  hasPosition?: boolean;
  incentiveValue?: string;
  incentiveSymbol?: string;
  organicApyOnly?: boolean;
}

export interface LeveragedDashboardProps {
  productData: {
    sectionTitle?: string;
    data: DashboardDataProps[];
    hasLeveragedPosition?: boolean;
    hasNegativePosition?: boolean;
  }[];
  isLoading?: boolean;
}

export interface ProductDashboardProps {
  productData: {
    sectionTitle?: string;
    data: DashboardDataProps[];
    hasLeveragedPosition?: boolean;
    hasNegativePosition?: boolean;
  }[];
  headerData: {
    toggleOptions: React.ReactNode[];
    messageBoxText: any;
  };
  isLoading?: boolean;
}

export const ProductDashboard = ({
  productData,
  headerData,
}: ProductDashboardProps) => {
  const theme = useTheme();
  const isLoading = productData.length === 0;
  return (
    <MainContainer sx={{ marginTop: isLoading ? theme.spacing(8.625) : '0px' }}>
      <DashboardHeader headerData={headerData} />
      <LeveragedDashboard productData={productData} isLoading={isLoading} />
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
