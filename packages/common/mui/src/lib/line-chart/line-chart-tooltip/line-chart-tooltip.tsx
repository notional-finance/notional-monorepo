import { TooltipProps } from 'recharts';
import { Box, styled, useTheme } from '@mui/material';
import { H5 } from '../../typography/typography';
import { formatNumberToDigits } from '@notional-finance/helpers';
import { LineChartConfigProps } from '../line-chart';
import { getDateString } from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable-hooks';

interface LineChartToolTipProps extends TooltipProps<number, string> {
  lineConfig: LineChartConfigProps[];
}

export const LineChartToolTip = (props: LineChartToolTipProps) => {
  const theme = useTheme();
  const { isMobileView } = useAppStore();
  const { payload, lineConfig } = props;

  return (
    <ToolTipBox>
      <Item>
        <H5>
          {payload?.[0]?.payload?.date &&
            getDateString(
              payload?.[0]?.payload?.date,
              isMobileView
                ? {
                    monthOnly: true,
                    monthLong: true,
                  }
                : {
                    hideYear: false,
                  }
            )}
        </H5>
      </Item>
      {/* Reverse the payload in a stacked bar chart so the tooltips match the order of the
        bars as they show up */}
      {payload?.map((item, index) => (
        <div key={index}>
          {item?.value && item.value !== 0
            ? lineConfig.map(
                (config, index) =>
                  item.payload[config.dataKey] && (
                    <Item key={index}>
                      <Box
                        sx={{
                          height: theme.spacing(2),
                          width: theme.spacing(0.75),
                          borderRadius: '4px',
                          backgroundColor: `${lineConfig[index].fill}`,
                        }}
                      />
                      <Box
                        component={'span'}
                        sx={{
                          marginLeft: theme.spacing(1),
                          marginRight: theme.spacing(0.5),
                        }}
                      >
                        {item.payload[config.dataKey] && config.currencySymbol
                          ? `${config.currencySymbol}${formatNumberToDigits(
                              item.payload[config.dataKey]
                            )}`
                          : `${config.currencySymbol}0`}
                      </Box>
                      <H5>{config?.toolTipTitle}</H5>
                    </Item>
                  )
              )
            : null}
        </div>
      ))}
    </ToolTipBox>
  );
};

const Item = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    border-left: 3px;
    border-top: 0px;
    border-right: 0px;
    border-bottom: 0px;
    margin: ${theme.spacing(1)};
    padding-left: ${theme.spacing(1)};
    whitespace: nowrap;
    span {
      color: ${theme.palette.typography.main};
    }
    align-items: center;
  `
);

const ToolTipBox = styled(Box)(
  ({ theme }) => `
    background: ${theme.palette.common.white};
    padding: ${theme.spacing(2)};
    text-align: left;
    box-shadow: ${theme.shape.shadowStandard};
    outline: none;
  `
);

export default LineChartToolTip;
