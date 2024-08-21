import { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { StyledButton } from '@notional-finance/mui';
import { QualifyingProducts } from './qualifying-products';
import MyBreakdown from './my-breakdown';
import { HowItWorks } from './how-it-works';

export const PointsDashboardManager = () => {
  const theme = useTheme();
  const [activeButton, setActiveButton] = useState<string>(
    'qualifying-products'
  );
  const buttonData = [
    {
      label: 'Qualifying Products',
      key: 'qualifying-products',
    },
    {
      label: 'My Breakdown',
      key: 'my-breakdown',
    },
    {
      label: 'How it Works',
      key: 'how-it-works',
    },
  ];

  return (
    <Box>
      <StyledContainer>
        {buttonData.map(({ label, key }, i) => (
          <StyledButton
            key={i}
            onClick={() => setActiveButton(key)}
            variant="outlined"
            active={activeButton === key}
            theme={theme}
          >
            {label}
          </StyledButton>
        ))}
      </StyledContainer>
      {activeButton === 'qualifying-products' && <QualifyingProducts />}
      {activeButton === 'my-breakdown' && <MyBreakdown />}
      {activeButton === 'how-it-works' && <HowItWorks />}
    </Box>
  );
};

const StyledContainer = styled(Box)(
  ({ theme }) => `
      padding-top: ${theme.spacing(13)};
      grid-gap: ${theme.spacing(2)};
      display: flex;
      margin-bottom: ${theme.spacing(6)};
      ${theme.breakpoints.down('sm')} {
        flex-direction: column;
        grid-gap: ${theme.spacing(3)};
      } 
  `
);

export default PointsDashboardManager;
