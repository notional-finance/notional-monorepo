import { Typography, useTheme } from '@mui/material';
import CountUp from '../count-up/count-up';
import { ReactNode } from 'react';

/* eslint-disable-next-line */
export interface TradeActionTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
  value?: number;
  valueSuffix?: string;
}

export function TradeActionTitle({
  title,
  value,
  subtitle,
  valueSuffix = '',
}: TradeActionTitleProps) {
  const theme = useTheme();

  return (
    <>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          color: theme.palette.background.accentDefault,
          textTransform: 'capitalize',
          wordBreak: 'break-all',
          fontSize: {
            xs: '2rem',
            sm: '2rem',
            md: '3rem',
            lg: '3rem',
            xl: '3rem',
          },
          fontWeight: 700,
          '&>span': {
            fontSize: {
              xs: '2rem',
              sm: '2rem',
              md: '3rem',
              lg: '3rem',
              xl: '3rem',
            },
            fontWeight: 700,
          },
        }}
      >
        {!!value && !isNaN(value) && (
          <CountUp value={value} suffix={valueSuffix} />
        )}
        &nbsp;
        {title}
      </Typography>
      {!!subtitle && (
        <Typography
          variant="subtitle1"
          component="span"
          sx={{
            color: theme.palette.primary.dark,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </>
  );
}

export default TradeActionTitle;
