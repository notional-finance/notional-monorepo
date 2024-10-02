import { Box, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import CountUp from '../count-up/count-up';
import { NotionalTheme } from '@notional-finance/styles';

 
export interface BoxDisplayProps {
  title: ReactNode;
  value?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  nonValueDisplay?: string;
  symbol?: ReactNode;
  overrides?: Record<string, string | number | boolean>;
  decimals?: number;
}

export function BoxDisplay({
  title,
  value,
  valuePrefix = '',
  valueSuffix = '',
  symbol = '',
  nonValueDisplay = '--',
  overrides = {},
  decimals,
}: BoxDisplayProps) {
  const theme = useTheme() as NotionalTheme;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderImageSource: 'unset',
        borderImageSlice: 'unset',
        borderImageWidth: 'unset',
        borderImageOutset: 'unset',
        borderImageRepeat: 'unset',
        borderRadius: theme.shape.borderRadius(),
        background: theme.palette.common.white,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: theme.palette.borders.paper,
        padding: '1.875rem',
        margin: {
          xs: '10px 15px',
          sm: '10px 15px',
          md: '0px 15px',
          lg: '0px 15px',
          xl: '0px 15px',
        },
        width: '100%',
        ...overrides,
      }}
    >
      <Typography
        component="div"
        sx={{
          fontWeight: 500,
          fontSize: '1rem',
          color: theme.palette.typography.main,
          background: 'unset',
          backgroundClip: 'unset',
          WebkitBackgroundClip: 'unset',
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          marginTop: '1rem',
        }}
      >
        {!!value && value !== 0 && (
          <>
            <Typography
              component="span"
              sx={{
                '&>span': {
                  fontSize: '1.5rem',
                },
                color: theme.palette.common.black,
              }}
            >
              <CountUp
                value={value}
                suffix={valueSuffix}
                prefix={valuePrefix}
                decimals={decimals}
              />
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '1rem',
                paddingLeft: '0.5rem',
                color: theme.palette.common.black,
              }}
            >
              {symbol}
            </Typography>
          </>
        )}
        {!value && (
          <Typography
            component="span"
            sx={{
              fontSize: '1.5rem',
              color: theme.palette.typography.light,
            }}
          >
            {nonValueDisplay}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default BoxDisplay;
