import { Box, styled } from '@mui/material';
import { H5 } from '../../typography/typography';
import { TooltipProps } from 'recharts';
import { BarConfigProps } from '../bar-chart';
import { getDateString } from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export interface BarChartToolTipProps extends TooltipProps<number, string> {
  barConfig: BarConfigProps[];
}

export const BarChartToolTip = (props: BarChartToolTipProps) => {
  const { payload, barConfig } = props;
  let totalApy = 0;

  if (payload) {
    totalApy =
      payload[0]?.payload.noteApy +
      payload[0]?.payload.arbApy +
      payload[0]?.payload.organicApy;
  }

  return (
    <ToolTipBox>
      <Item>
        <Box component={'span'}>
          {payload && payload.length > 0 ? formatNumberAsPercent(totalApy) : ''}
        </Box>
      </Item>
      <Item>
        <Box component={'span'}>
          {payload && payload.length > 0
            ? getDateString(payload[0]?.payload?.timestamp)
            : ''}
        </Box>
      </Item>
      {payload?.map((item, index) => (
        <Item key={index}>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              borderLeft: `3px solid ${barConfig[index].fill}`,
            }}
          >
            <Box
              component={'span'}
              sx={{ marginLeft: '8px', marginRight: '8px' }}
            >
              {/* {item.value && barConfig[index]?.currencySymbol !== undefined
                ? `${barConfig[index]?.currencySymbol}${formatNumberToDigits(
                    item.value
                  )}`
                : `${barConfig[index]?.currencySymbol}0`} */}

              {item.value ? `${formatNumberAsPercent(item.value)}` : `0 %`}
            </Box>
            {barConfig[index]?.toolTipTitle}
          </Box>
        </Item>
      ))}
    </ToolTipBox>
  );
};

const Item = styled(H5)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  border-left: 3px;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
  margin: ${theme.spacing(1)};
  padding-left: 8px;
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
