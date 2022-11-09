import { Box, styled } from '@mui/material';

export const TradeSummaryBox = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  background: ${theme.palette.common.white};
  margin-top: 16px;
  padding: 24px;
  width: 100%;
`
);

export default TradeSummaryBox;
