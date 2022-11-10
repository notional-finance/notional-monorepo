import { useTheme, Box, Typography } from '@mui/material';
import { CheckmarkRoundIcon, TokenIcon } from '@notional-finance/icons';

export interface CurrencyImgProps {
  symbol: string;
  enabled: boolean;
}

export const CurrencyImg = ({ symbol, enabled }: CurrencyImgProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <CheckmarkRoundIcon
        foregroundColor={theme.palette.common.white}
        backgroundColor={theme.palette.primary.main}
        sx={{
          position: 'relative',
          visibility: enabled ? 'visible' : 'hidden',
          top: '1rem',
          left: '-1rem',
          zIndex: 11,
          fontSize: '1rem',
        }}
      />
      <Box
        sx={{
          zIndex: 10,
          position: 'relative',
          width: '2.5rem',
          height: '2.5rem',
          padding: '.25rem',
          img: {
            position: 'relative',
            zIndex: 10,
          },
          '&:hover': {
            '&::after': {
              visibility: 'visible',
              opacity: 1,
            },
          },
          '&::after': {
            visibility: enabled ? 'visible' : 'hidden',
            opacity: enabled ? 1 : 0,
            position: 'absolute',
            content: '""',
            top: '0',
            left: '0',
            borderRadius: '50%',
            border: `5px solid ${theme.palette.primary.main}`,
            padding: '15px',
            boxShadow: `1px 2px 3px 0px #14296633`,
            zIndex: 9,
            width: 0,
            height: 0,
            transition: 'visibility 0.5s linear, opacity 0.5s linear',
          },
        }}
      >
        <TokenIcon symbol={symbol} size="large" />
      </Box>
      <Typography
        component="div"
        sx={{
          fontSize: '.75rem',
          fontWeight: 500,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        {symbol}
      </Typography>
    </Box>
  );
};
