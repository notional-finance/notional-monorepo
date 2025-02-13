import { ReactNode } from 'react';
import { H5, LargeNumber } from '../typography/typography';
import { Box, styled, useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

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
      {chartHeaderTotalsData.map(({ title, value }, index) => (
        <ContentWrapper
          key={index}
          lastIndex={lastIndex}
          index={index}
          theme={theme}
          dataLength={chartHeaderTotalsData.length}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: index === 0 ? 'flex-start' : 'flex-end',
              justifyContent: 'center',
            }}
          >
            <Title>{title}</Title>
            <LargeNumber
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: index === 0 ? '26px' : '24px',
              }}
            >
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
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: 2px;
  text-transform: uppercase;
  white-space: nowrap;
`
);

export default ChartHeaderTotals;
