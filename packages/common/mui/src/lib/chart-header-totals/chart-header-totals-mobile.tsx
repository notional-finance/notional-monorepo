import { ReactNode } from 'react';
import { H5, LargeNumber } from '../typography/typography';
import { Box, styled, useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

interface ColorBarProps {
  barColor: string;
  theme: NotionalTheme;
}
interface ContentWrapperProps {
  lastIndex: number;
  index: number;
  theme: NotionalTheme;
  dataLength: number;
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
  const lastIndex = chartHeaderTotalsData.length - 1;

  return (
    <HeadingContainer>
      {chartHeaderTotalsData.map(({ title, value, fill }, index) => (
        <ContentWrapper
          key={index}
          lastIndex={lastIndex}
          index={index}
          theme={theme}
          dataLength={chartHeaderTotalsData.length}
        >
          <ColorBar barColor={fill} theme={theme}></ColorBar>
          <Box>
            <Title>{title}</Title>
            <LargeNumber sx={{ display: 'flex', alignItems: 'center' }}>
              {value}
            </LargeNumber>
          </Box>
        </ContentWrapper>
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
  
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop: string) =>
    prop !== 'barColor' &&
    prop !== 'lastIndex' &&
    prop !== 'index' &&
    prop !== 'dataLength',
})(
  ({ lastIndex, index, theme, dataLength }: ContentWrapperProps) => `
  margin-right: ${
    index === 0
      ? theme.spacing(8)
      : lastIndex === index
      ? '0px'
      : theme.spacing(5)
  };
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${
    lastIndex === index && dataLength > 1 ? 'end' : 'flex-start'
  };
  flex: ${lastIndex === index ? 1 : 'unset'};
  ${theme.breakpoints.down('sm')} {
    margin-right: 0px;
  }
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
  height: ${theme.spacing(5)};
  background: ${barColor};
  margin-right: ${theme.spacing(1)};
`
);

export default ChartHeaderTotals;
