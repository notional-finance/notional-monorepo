import { Box, useTheme } from '@mui/material';
import React, { ReactNode } from 'react';
import { Body, LabelValue } from '../typography/typography';
import CountUp from '../count-up/count-up';

 
export interface TotalBoxProps {
  title: ReactNode;
  value?: number | React.ReactNode;
  prefix?: string;
  suffix?: string;
  Icon?: React.ElementType;
  decimals?: number;
}

export function TotalBox({
  title,
  value,
  Icon,
  suffix,
  prefix,
  decimals,
}: TotalBoxProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        width: '100%',
        borderRadius: theme.shape.borderRadius(),
        padding: theme.spacing(2),
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
        {title}
        {Icon && (
          <Icon
            title={title}
            sx={{ marginLeft: theme.spacing(0.5), height: theme.spacing(2) }}
          />
        )}
      </Body>
      <LabelValue>
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
      </LabelValue>
    </Box>
  );
}

export default TotalBox;
