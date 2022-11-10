import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { ReactNode } from 'react';

/* eslint-disable-next-line */
export interface TradeActionHeaderProps {
  token: string;
  hideTokenName?: boolean;
  actionText: ReactNode;
}

export function TradeActionHeader({ token, actionText, hideTokenName }: TradeActionHeaderProps) {
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
      <Box
        sx={{
          fontSize: '1.375rem',
          fontWeight: 400,
        }}
      >
        {actionText}
        {hideTokenName ? null : `\xa0${token}`}
      </Box>
    </Box>
  );
}

export default TradeActionHeader;
