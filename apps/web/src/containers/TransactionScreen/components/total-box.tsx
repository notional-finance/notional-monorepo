import { Box, styled, useTheme } from '@mui/material';
import React from 'react';
import { Caption, LargeNumber, LargeNumberLabel } from '@notional-finance/mui';
import CountUp from '@notional-finance/mui/lib/count-up/count-up';
import { UpwardIcon } from '@notional-finance/icons';

export interface TotalBoxProps {
  title: string;
  value?: string | number | React.ReactNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    duration: string;
  };
}

export function TotalBox({
  title,
  value,
  suffix,
  prefix,
  decimals,
  trend,
}: TotalBoxProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        width: '100%',
        borderRadius: theme.shape.borderRadius(),
        padding: theme.spacing(3, 4),
        border: theme.shape.borderStandard,
        whiteSpace: 'nowrap',
      }}
    >
      <LargeNumberLabel gutter="default">{title}</LargeNumberLabel>
      <ContentContainer>
        <LargeNumber>
          {value !== undefined && typeof value === 'number' ? (
            <CountUp
              value={value}
              prefix={prefix}
              suffix={suffix}
              duration={1}
              decimals={decimals}
            />
          ) : (
            value
          )}
        </LargeNumber>
        {trend && (
          <TrendContainer>
            {trend?.direction === 'up' ? (
              <UpwardIcon
                sx={{ color: theme.palette.primary.main, width: 9 }}
              />
            ) : (
              <UpwardIcon
                sx={{
                  color: theme.palette.error.main,
                  width: 9,
                  transform: 'rotate(180deg)',
                }}
              />
            )}
            <Caption>
              <span
                style={{
                  color:
                    trend?.direction === 'up'
                      ? theme.palette.primary.main
                      : theme.palette.error.main,
                }}
              >
                {trend?.direction === 'up' ? '+' : '-'}
                {trend?.value}%
              </span>{' '}
              ({trend?.duration})
            </Caption>
          </TrendContainer>
        )}
      </ContentContainer>
    </Box>
  );
}

const TrendContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: theme.spacing(2),
  },
}));

export default TotalBox;
