import { Box, useTheme } from '@mui/material';
import { DoubleTokenIcon, TokenIcon } from '@notional-finance/icons';
import { ReactNode } from 'react';
import { H3 } from '../typography/typography';

export interface TradeActionHeaderProps {
  token: string;
  tokenBottom?: string;
  actionText: ReactNode;
}

export function TradeActionHeader({
  token,
  actionText,
  tokenBottom,
}: TradeActionHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.common.white,
        color: theme.palette.common.black,
        boxShadow: theme.shape.shadowLandingPage,
        border: `1px solid ${theme.palette.typography.accent}`,
        borderRadius: theme.shape.borderRadius(),
      }}
    >
      {tokenBottom ? (
        <DoubleTokenIcon
          symbolTop={token}
          symbolBottom={tokenBottom}
          size="medium"
        />
      ) : (
        <TokenIcon symbol={token} size="medium" />
      )}
      <H3
        sx={{
          fontSize: theme.typography.pxToRem(22),
          fontWeight: theme.typography.fontWeightRegular,
          marginLeft: theme.spacing(2),
        }}
      >
        {actionText}
      </H3>
    </Box>
  );
}

export default TradeActionHeader;
