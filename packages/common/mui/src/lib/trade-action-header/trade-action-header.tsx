import { Box, useTheme } from '@mui/material';
import { DoubleTokenIcon, TokenIcon } from '@notional-finance/icons';
import { ReactNode } from 'react';

/* eslint-disable-next-line */
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
        border: '1px solid',
        borderImageSource: theme.gradient.aqua,
        borderImageSlice: 1,
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
      <Box
        sx={{
          fontWeight: theme.typography.fontWeightRegular,
          marginLeft: theme.spacing(2),
        }}
      >
        {actionText}
      </Box>
    </Box>
  );
}

export default TradeActionHeader;
