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
`
);

export default TradeSummaryBox;
