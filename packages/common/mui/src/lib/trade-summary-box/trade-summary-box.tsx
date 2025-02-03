import { Box, styled } from '@mui/material';

export const TradeSummaryBox = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(2)};
  padding-top: ${theme.spacing(3)};
  width: 100%;

  ${theme.breakpoints.down('sm')} {
    padding: 0;
    border-radius: 0;
    border: none;
    background: transparent;
  }
`
);

export default TradeSummaryBox;
