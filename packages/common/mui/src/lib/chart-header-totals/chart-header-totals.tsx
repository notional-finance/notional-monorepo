import { ReactNode } from 'react';
import { H5, LargeNumber } from '../typography/typography';
import { Box, styled, useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { AngledArrowIcon } from '@notional-finance/icons';

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
interface PercentPillProps {
  isNegative: boolean;
  theme: NotionalTheme;
}

export interface ChartHeaderTotalsDataProps {
  title: ReactNode;
  value: string;
  percentChange: string;
  fill: string;
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
      {chartHeaderTotalsData.map(
        ({ title, value, percentChange, fill }, index) => (
          <Box
            key={index}
            sx={{
              flex: index === 0 ? 1 : 0,
              marginRight: index === 1 ? theme.spacing(8) : '0px',
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
                <PercentPill
                  isNegative={percentChange.includes('-')}
                  theme={theme}
                >
                  {percentChange}
                  <AngledArrowIcon
                    sx={{
                      marginLeft: theme.spacing(0.5),
                      marginRight: theme.spacing(-0.25),
                      color: !percentChange.includes('-')
                        ? theme.palette.primary.light
                        : theme.palette.error.main,
                      width: theme.spacing(1.25),
                      transform: !percentChange.includes('-')
                        ? 'rotate(180deg)'
                        : 'rotate(270deg)',
                    }}
                  />
                </PercentPill>
              </LargeNumber>
            </Box>
          </Box>
        )
      )}
    </HeadingContainer>
  );
};

const HeadingContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: ${theme.spacing(1)};
  margin-left: ${theme.spacing(2.5)};
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

const PercentPill = styled(H5, {
  shouldForwardProp: (prop: string) => prop !== 'isNegative',
})(
  ({ isNegative, theme }: PercentPillProps) => `
  display: flex;
  font-size: 10px;
  border-radius: ${theme.shape.borderRadiusLarge};
  margin-left: ${theme.spacing(3)};
  background: ${
    isNegative ? theme.palette.error.light : theme.palette.info.light
  };
  align-items: center;
  padding: 0px 8px;
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
