import { ReactNode, SetStateAction, Dispatch } from 'react';
import { H4 } from '../typography/typography';
import { Box, styled, useTheme } from '@mui/material';
import { InfoIcon } from '@notional-finance/icons';
import { ChartLegendProps, ChartLegend } from './chart-legend/chart-legend';

export interface LegendData {
  textHeader?: ReactNode;
  legendOne?: ChartLegendProps;
  legendTwo?: ChartLegendProps;
  totalLegend?: ChartLegendProps;
}

export interface ChartHeaderProps {
  legendData?: LegendData;
  areaChartButtonLabel?: ReactNode;
  barChartButtonLabel?: ReactNode;
  setChartInfoBoxActive?: Dispatch<SetStateAction<boolean | undefined>>;
  headerCallBack?: Dispatch<SetStateAction<boolean>>;
  displayAreaChart?: boolean;
}

export const ChartHeader = ({
  headerCallBack,
  barChartButtonLabel,
  areaChartButtonLabel,
  displayAreaChart,
  legendData,
  setChartInfoBoxActive,
}: ChartHeaderProps) => {
  const theme = useTheme();

  return (
    <HeadingContainer>
      {legendData?.textHeader && !headerCallBack && (
        <H4>{legendData.textHeader}</H4>
      )}
      {headerCallBack && (
        <ButtonWrapper>
          <ButtonText
            theme={theme}
            sx={{
              fontWeight: displayAreaChart ? '500' : '600',
              height: '100%',
              borderBottom: displayAreaChart
                ? 'none'
                : `3px solid ${theme.palette.primary.light}`,
              color: displayAreaChart
                ? theme.palette.typography.light
                : theme.palette.primary.light,
            }}
            onClick={() => headerCallBack(false)}
          >
            {barChartButtonLabel}
          </ButtonText>
          <ButtonText
            theme={theme}
            sx={{
              fontWeight: displayAreaChart ? '600' : '500',
              borderBottom: displayAreaChart
                ? `3px solid ${theme.palette.primary.light}`
                : 'none',
              color: displayAreaChart
                ? theme.palette.primary.light
                : theme.palette.typography.light,
            }}
            onClick={() => headerCallBack(true)}
          >
            {areaChartButtonLabel}
          </ButtonText>
        </ButtonWrapper>
      )}

      <LegendWrapper>
        {legendData?.legendOne && (
          <ChartLegend
            value={legendData?.legendOne.value}
            label={legendData?.legendOne.label}
            lineColor={legendData?.legendOne.lineColor}
            lineType={legendData?.legendOne.lineType}
          />
        )}
        {legendData?.legendTwo && (
          <ChartLegend
            value={legendData?.legendTwo.value}
            label={legendData?.legendTwo.label}
            lineColor={legendData?.legendTwo.lineColor}
            lineType={legendData?.legendTwo.lineType}
          />
        )}
        {legendData?.totalLegend && (
          <ChartLegend
            value={legendData?.totalLegend.value}
            label={legendData?.totalLegend.label}
            lineColor={legendData?.totalLegend.lineColor}
            lineType={legendData?.totalLegend.lineType}
            textAlign={'right'}
          />
        )}
        {setChartInfoBoxActive && (
          <InfoIcon
            onClick={() => setChartInfoBoxActive(true)}
            fill={theme.palette.primary.light}
            sx={{
              marginLeft: theme.spacing(3),
              cursor: 'pointer',
              height: theme.spacing(2.5),
              width: theme.spacing(2.5),
            }}
          />
        )}
      </LegendWrapper>
    </HeadingContainer>
  );
};

const LegendWrapper = styled('div')`
  align-items: center;
  display: flex;
`;

const HeadingContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing(1)};
  margin-left: ${theme.spacing(2.5)};
  margin-right: ${theme.spacing(2.5)};
`
);

const ButtonWrapper = styled(Box)(
  ({ theme }) => `
  white-space: nowrap;
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  width: auto;
  display: flex;
  padding: ${theme.spacing(0, 1)};
  grid-gap: ${theme.spacing(2)};
`
);

const ButtonText = styled(H4)(
  ({ theme }) => `
  cursor: pointer;
  padding: ${theme.spacing(0.5, 0)};
  
  `
);

export default ChartHeader;
