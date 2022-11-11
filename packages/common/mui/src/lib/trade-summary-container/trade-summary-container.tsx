import { styled, Box } from '@mui/material';

export const TradeSummaryContainer = styled(Box)(
  ({ theme }) => `
  max-width: 800px;
  min-width: 690px;
  padding: 0 16px;
  ${theme.breakpoints.down('sm')} {
    min-width: 0px;
    display: none;
    width: 100%;
  }
`
);

export default TradeSummaryContainer;
