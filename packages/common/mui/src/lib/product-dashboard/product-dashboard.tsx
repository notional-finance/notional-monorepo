import { Box, styled } from '@mui/material';
import { VaultCard } from './components';

export interface DashboardDataProps {
  title: string;
  apy: string;
  tvl: string;
  symbol: string;
  incentiveValue?: string;
  incentiveSymbol?: string;
  organicApyOnly?: boolean;
}

interface ProductDashboardProps {
  productData: DashboardDataProps[];
}

export const ProductDashboard = ({ productData }: ProductDashboardProps) => {
  return (
    <MainContainer>
      <GridCardContainer>
        {productData.map(
          (
            {
              title,
              apy,
              tvl,
              symbol,
              incentiveValue,
              organicApyOnly,
              incentiveSymbol,
            },
            index
          ) => (
            <VaultCard
              key={index}
              title={title}
              apy={apy}
              tvl={tvl}
              symbol={symbol}
              incentiveValue={incentiveValue}
              incentiveSymbol={incentiveSymbol}
              organicApyOnly={organicApyOnly}
            />
          )
        )}
      </GridCardContainer>
    </MainContainer>
  );
};

const MainContainer = styled(Box)(
  ({ theme }) => `
    max-width: 1280px;
    width: 100%;
    background: ${theme.palette.background.paper};
    padding: ${theme.spacing(3)};
    border-radius: 12px;
    box-shadow: 0px 30px 54px -15px rgba(20, 42, 74, 0.30);
      `
);

const GridCardContainer = styled(Box)(
  ({ theme }) => `
    display: grid;
    gap: ${theme.spacing(3)};
    grid-template-columns: repeat(2, 1fr);
    ${theme.breakpoints.down('sm')} {
        grid-template-columns: repeat(1, 1fr);
    }
      `
);

export default ProductDashboard;
