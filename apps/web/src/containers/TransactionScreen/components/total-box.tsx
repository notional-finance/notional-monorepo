import { Box, styled, useTheme } from '@mui/material';
import React, { ReactNode } from 'react';
import { Body, Caption, H4, H5 } from '@notional-finance/mui';
import CountUp from '@notional-finance/mui/lib/count-up/count-up';
import { UpwardIcon } from '@notional-finance/icons';

/* eslint-disable-next-line */
export interface TotalBoxProps {
  title: ReactNode;
  value?: number | React.ReactNode;
  prefix?: string;
  suffix?: string;
  Icon?: React.ElementType;
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
  Icon,
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
        padding: theme.spacing(2, 3),
        border: theme.shape.borderStandard,
        whiteSpace: 'nowrap',
      }}
    >
      <Body
        sx={{
          marginBottom: theme.spacing(0.5),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <H5>{title}</H5>
        {Icon && (
          <Icon
            title={title}
            sx={{ marginLeft: theme.spacing(0.5), height: theme.spacing(2) }}
          />
        )}
      </Body>
      <ContentContainer>
        <H4>
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
        </H4>
        <TrendContainer>
          {trend?.direction === 'up' ? (
            <UpwardIcon sx={{ color: theme.palette.primary.main, width: 9 }} />
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
  justifyContent: 'space-between',
  alignItems: 'center',

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));

export default TotalBox;
