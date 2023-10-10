import { ReactNode } from 'react';
import { H5, LargeNumber } from '../typography/typography';
import { Box, styled, useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

export enum LEGEND_LINE_TYPES {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  NONE = 'none',
}

interface ColorBarProps {
  barColor: string;
  theme: NotionalTheme;
}

export interface ChartHeaderTotalsDataProps {
  title: ReactNode;
  fill: string;
  value?: string;
}

export interface ChartHeaderTotalsProps {
  chartHeaderTotalsData: ChartHeaderTotalsDataProps[];
}

export const ChartHeaderTotals = ({
  chartHeaderTotalsData,
}: ChartHeaderTotalsProps) => {
  const theme = useTheme();

  return (
    <HeadingContainer>
      {chartHeaderTotalsData.map(({ title, value, fill }, index) => (
        <Box
          key={index}
          sx={{
            marginRight: index === 0 ? theme.spacing(8) : theme.spacing(5),
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <ColorBar barColor={fill} theme={theme}></ColorBar>
          <Box>
            <Title>{title}</Title>
            <LargeNumber sx={{ display: 'flex', alignItems: 'center' }}>
              {value}
            </LargeNumber>
          </Box>
        </Box>
      ))}
    </HeadingContainer>
  );
};

const HeadingContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: ${theme.spacing(1)};
  margin-left: ${theme.spacing(1.25)};
  margin-right: ${theme.spacing(2.5)};
`
);

const Title = styled(H5)(
  `
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: 3px;
  text-transform: uppercase;
  white-space: nowrap;
`
);

const ColorBar = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'barColor',
})(
  ({ barColor, theme }: ColorBarProps) => `
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  width: 6px;
  height: 40px;
  background: ${barColor};
  margin-right: ${theme.spacing(1)};
`
);

export default ChartHeaderTotals;
