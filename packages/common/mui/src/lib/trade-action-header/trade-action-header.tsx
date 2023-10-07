import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { ReactNode } from 'react';
import { H3 } from '../typography/typography';

/* eslint-disable-next-line */
export interface TradeActionHeaderProps {
  token: string;
  actionText: ReactNode;
}

export function TradeActionHeader({
  token,
  actionText,
}: TradeActionHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        marginBottom: '1.5625rem',
        padding: '0.75rem',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.common.white,
        color: theme.palette.common.black,
        boxShadow: theme.shape.shadowLandingPage,
        border: '1px solid',
        borderImageSource: theme.gradient.aqua,
        borderImageSlice: 1,
        '&>img': {
          marginRight: '1rem',
        },
      }}
    >
      <TokenIcon symbol={token} size="medium" />
      <H3 sx={{ fontWeight: theme.typography.fontWeightRegular }}>
        {actionText}
      </H3>
    </Box>
  );
}

export default TradeActionHeader;
