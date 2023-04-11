import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { H5 } from '@notional-finance/mui';

export const ProductCards = () => {
  const theme = useTheme();

  return (
    <Container>
      <H5>Product 1</H5>
      <CardContainer>
        <Card />
        <Card />
        <Card />
        <Card />
      </CardContainer>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    width: 1200px;
    height: 1200px;
    margin: auto;
    top: -60px;
    position: relative;
    background: ${colors.black};
    padding: ${theme.spacing(17)};
    border-radius: ${theme.shape.borderRadiusLarge};
    border: ${theme.shape.borderHighlight};
  `
);

const CardContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
  `
);
const Card = styled(Box)(
  ({ theme }) => `
    height: 400px;
    width: 200px;
    background: red;
  `
);

//black

export default ProductCards;
