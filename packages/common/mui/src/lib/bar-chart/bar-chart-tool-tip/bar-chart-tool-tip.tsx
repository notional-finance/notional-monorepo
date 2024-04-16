import { Box, styled, useTheme } from '@mui/material';
import { H5 } from '../../typography/typography';
import { TooltipProps } from 'recharts';
import { BarConfigProps } from '../bar-chart';
import { getDateString } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import {
  formatNumberAsPercent,
  formatNumberToDigits,
} from '@notional-finance/helpers';

export interface BarChartToolTipProps extends TooltipProps<number, string> {
  barConfig: BarConfigProps[];
  isStackedBar?: boolean;
}

export const BarChartToolTip = (props: BarChartToolTipProps) => {
  const theme = useTheme();
  const { payload, barConfig, isStackedBar } = props;
  const totalApy = payload?.reduce((acc, p) => acc + (p?.value || 0), 0) || 0;
  // This needs to be reversed when we look up the matching indexes
  const bars = isStackedBar ? barConfig.slice().reverse() : barConfig;

  const totalBackgroundColor = `linear-gradient(to bottom, ${payload
    ?.filter((item) => item['value'] && item['value'] > 0)
    .map((item) => item['fill'])
    .toString()})`;

  return (
    <ToolTipBox>
      <Item>
        <Box component={'span'}>
          {payload && payload.length > 0
            ? getDateString(payload[0]?.payload?.timestamp)
            : ''}
        </Box>
      </Item>
      {/* Reverse the payload in a stacked bar chart so the tooltips match the order of the
      bars as they show up */}
      {(isStackedBar ? payload?.reverse() : payload)?.map((item, index) => (
        <div key={index}>
          {item?.value && item.value !== 0 ? (
            <Item key={index}>
              <Box
                sx={{
                  height: theme.spacing(2),
                  width: theme.spacing(0.75),
                  borderRadius: '4px',
                  backgroundColor: `${bars[index].fill}`,
                }}
              />
              <Box
                component={'span'}
                sx={{
                  marginLeft: theme.spacing(1),
                  marginRight: theme.spacing(0.5),
                  width: theme.spacing(7.5),
                }}
              >
                {isStackedBar &&
                  (item.value ? `${formatNumberAsPercent(item.value)}` : `0 %`)}
                {!isStackedBar &&
                  (item.value && bars[index]?.currencySymbol !== undefined
                    ? `${bars[index]?.currencySymbol}${formatNumberToDigits(
                        item.value
                      )}`
                    : `${bars[index]?.currencySymbol}0`)}
              </Box>
              {bars[index]?.toolTipTitle}
            </Item>
          ) : null}
        </div>
      ))}
      {isStackedBar && payload && payload.length > 1 && (
        <Item>
          <Box
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(0.75),
              borderRadius: '4px',
              background: totalBackgroundColor,
            }}
          />
          <Box
            component={'span'}
            sx={{
              marginLeft: theme.spacing(1),
              marginRight: theme.spacing(0.5),
              width: theme.spacing(7.5),
            }}
          >
            {payload && payload.length > 0
              ? formatNumberAsPercent(totalApy)
              : ''}
          </Box>
          <FormattedMessage defaultMessage={'Total APY'} />
        </Item>
      )}
    </ToolTipBox>
  );
};

const Item = styled(H5)(
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

export default BarChartToolTip;
