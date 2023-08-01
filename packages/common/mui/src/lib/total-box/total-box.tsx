import { Box, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { Body, LabelValue } from '../typography/typography';

/* eslint-disable-next-line */
export interface TotalBoxProps {
  title: ReactNode;
  value?: string | number;
}

export function TotalBox({ title, value }: TotalBoxProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        width: '100%',
        borderRadius: theme.shape.borderRadius(),
        padding: theme.spacing(2),
        border: theme.shape.borderStandard,
      }}
    >
      <Body sx={{ marginBottom: theme.spacing(0.5) }}>{title}</Body>
      <LabelValue>{value}</LabelValue>
    </Box>
  );
}

export default TotalBox;
