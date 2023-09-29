import { ReactNode, SetStateAction, Dispatch } from 'react';
import { H4 } from '../typography/typography';
import { Box, styled, useTheme } from '@mui/material';
import { InfoIcon } from '@notional-finance/icons';
import { ChartLegend } from './chart-legend/chart-legend';

export enum LEGEND_LINE_TYPES {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  NONE = 'none',
}

export interface ChartHeaderDataProps {
  textHeader?: ReactNode;
  legendData?: {
    label: ReactNode;
    value?: any | undefined;
    lineColor?: string;
    lineType?: LEGEND_LINE_TYPES;
  }[];
}

export interface ChartHeaderProps {
  chartHeaderData?: ChartHeaderDataProps;
  areaChartButtonLabel?: ReactNode;
  barChartButtonLabel?: ReactNode;
  setChartInfoBoxActive?: Dispatch<SetStateAction<boolean | undefined>>;
  headerCallBack?: Dispatch<SetStateAction<boolean>>;
  displayAreaChart?: boolean;
  isMultiChart?: boolean;
  showInfoIcon?: boolean;
}

export const ChartHeader = ({
  headerCallBack,
  barChartButtonLabel,
  areaChartButtonLabel,
  displayAreaChart,
  chartHeaderData,
  showInfoIcon,
  setChartInfoBoxActive,
}: ChartHeaderProps) => {
  const theme = useTheme();

  return (
    <HeadingContainer>
      {chartHeaderData?.textHeader && !headerCallBack && (
        <H4>{chartHeaderData.textHeader}</H4>
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
        {chartHeaderData?.legendData &&
          chartHeaderData?.legendData.length > 0 &&
          chartHeaderData.legendData.map(
            ({ value, label, lineColor, lineType }, index) => (
              <ChartLegend
                key={index}
                value={value}
                label={label}
                lineColor={lineColor}
                lineType={lineType}
              />
            )
          )}
        {setChartInfoBoxActive && showInfoIcon && (
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
  align-items: center;
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
