import { ReactNode } from 'react';
import { LabelValue, Caption } from '../../typography/typography';
import { Box, styled } from '@mui/material';
import { LEGEND_LINE_TYPES } from '../../chart-header/chart-header';

export interface ChartLegendProps {
  label: ReactNode;
  lineColor?: string;
  lineType?: LEGEND_LINE_TYPES;
  textAlign?: string;
  value?: string;
}

export const ChartLegend = ({
  label,
  lineColor,
  lineType,
  textAlign,
  value,
}: ChartLegendProps) => {
  return (
    <LegendItem
      sx={{
        borderColor: lineColor || '',
        borderStyle: lineType || '',
        textAlign: textAlign || '',
      }}
    >
      <Box sx={{ display: 'flex' }}>
        {value !== undefined ? (
          <LabelValue>{value}</LabelValue>
        ) : (
          <LabelValue>--</LabelValue>
        )}
      </Box>
      <Caption sx={{ fontSize: '10px' }}>{label}</Caption>
    </LegendItem>
  );
};

const LegendItem = styled(Box)(
  ({ theme }) => `
  margin-left: ${theme.spacing(3)};
  padding-left: ${theme.spacing(2)};
  border-left: 3px;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
`
);

export default ChartLegend;
