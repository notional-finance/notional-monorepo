import { styled, useTheme, Box } from '@mui/material';
import { useUnstakeAction } from './use-unstake-action';
import { BodySecondary } from '@notional-finance/mui';

const StyledInfoBox = styled(Box)(
  ({ theme }) => `
    border-radius: ${theme.shape.borderRadiusLarge};
    background-color: ${theme.palette.background.default};
    padding: 1rem;
  `
);

export const RedemptionInfo = () => {
  const theme = useTheme();
  const { redemptionValue, sNOTERedeemUSDValue, sNOTERedemptionAmount } = useUnstakeAction();
  return (
    // TODO: switch this to trade properties grid
    <StyledInfoBox sx={{ marginBottom: '3.75rem' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <Box>
          <BodySecondary>sNOTE</BodySecondary>
          <div>{sNOTERedemptionAmount?.toDisplayString(2) ?? '0.00'}</div>
          <BodySecondary>${sNOTERedeemUSDValue?.toDisplayString(2) ?? '0.00'}</BodySecondary>
        </Box>
        <Box sx={{ borderRight: `1px solid ${theme.palette.borders.accentDefault}` }}></Box>
        <Box>
          <BodySecondary>ETH</BodySecondary>
          <div>{redemptionValue?.ethClaim.toDisplayString(2) ?? '0.00'}</div>
          <BodySecondary>${redemptionValue?.ethClaim.toDisplayString(2) ?? '0.00'}</BodySecondary>
        </Box>
        <Box>
          <BodySecondary>NOTE</BodySecondary>
          <div>{redemptionValue?.noteClaim.toDisplayString(2) ?? '0.00'}</div>
          <BodySecondary>
            ${redemptionValue?.noteClaim.toUSD().toDisplayString(2) ?? '0.00'}
          </BodySecondary>
        </Box>
      </Box>
    </StyledInfoBox>
  );
};
