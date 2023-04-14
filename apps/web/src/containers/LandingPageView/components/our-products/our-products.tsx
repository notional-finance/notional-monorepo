import { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { useProductCards } from './hooks';
import { ProductCards } from './components/product-cards';
import { H5, H2, Toggle } from '@notional-finance/mui';

export const OurProducts = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const { earnYieldData, borrowData } = useProductCards();
  const theme = useTheme();

  return (
    <Container>
      <TitleContainer>
        <Box id="title-text">
          <H5
            sx={{ color: colors.neonTurquoise, marginBottom: theme.spacing(2) }}
          >
            <FormattedMessage defaultMessage={'Our Products'} />
          </H5>
          <H2 sx={{ color: colors.white }}>
            <FormattedMessage defaultMessage={'With Notional You Can'} />
          </H2>
        </Box>
        <Toggle
          minHeight={theme.spacing(8)}
          width="373px"
          tabLabels={[
            <Box sx={{ fontSize: '20px' }}>
              <FormattedMessage defaultMessage={'Earn Yield'} />
            </Box>,
            <Box sx={{ fontSize: '20px' }}>
              <FormattedMessage defaultMessage={'Borrow'} />
            </Box>,
          ]}
          selectedTabIndex={selectedTab}
          onChange={(_, v) => setSelectedTab(v as number)}
        />
      </TitleContainer>

      <FlexWrapper>
        {selectedTab === 0
          ? earnYieldData.map((data, index) => (
              <ProductCards key={index} {...data} />
            ))
          : borrowData.map((data, index) => (
              <ProductCards key={index} {...data} />
            ))}
      </FlexWrapper>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    z-index: 2;
    width: 1200px;
    height: 1338px;
    margin: auto;
    top: -60px;
    position: relative;
    background: ${colors.black};
    padding: ${theme.spacing(17)};
    border-radius: ${theme.shape.borderRadiusLarge};
    border: ${theme.shape.borderHighlight};
    ${theme.breakpoints.down(1220)} {
      width: 1000px;
      padding: ${theme.spacing(6)};
    }

    ${theme.breakpoints.down(1000)} {
      width: 90%;
      height: 100%;
      padding: 48px;
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
      padding: 16px;
      margin-bottom: ${theme.spacing(11)};
      background: ${colors.white};
      border: none;
      width: 100%;
      top: 0;
    }
  `
);

const TitleContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${theme.breakpoints.down(1000)} {
      align-items: flex-start;
      flex-direction: column;
      h2 {
        margin-bottom: ${theme.spacing(7)};
      }
    }
    ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
      margin-top: ${theme.spacing(11)};
      width: 100%;
      align-items: center;
      #title-text {
        width: 100%;
      }
      h2 {
        color: ${colors.black};
      }
      h5 {
        color: ${colors.aqua};
        font-size: 16px;
        font-weight: 600;
      }
    }
  `
);

const FlexWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
    ${theme.breakpoints.down(1000)} {
      flex-direction: column;
    }
  `
);

export default OurProducts;
