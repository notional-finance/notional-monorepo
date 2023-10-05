import { Box, styled } from '@mui/material';
import { H5 } from '../../typography/typography';
import { TooltipProps } from 'recharts';
import { BarConfigProps } from '../bar-chart';
import { useIntl } from 'react-intl';
import { formatNumberToDigits } from '@notional-finance/helpers';

export interface BarChartToolTipProps extends TooltipProps<number, string> {
  barConfig: BarConfigProps[];
}

export const BarChartToolTip = (props: BarChartToolTipProps) => {
  const { payload, barConfig } = props;
  const intl = useIntl();

  return (
    <ToolTipBox>
      {payload?.map((item, index) => (
        <Item key={index}>
          <Box>{barConfig[index]?.title}</Box>
          <Box>
            {item.value
              ? `${barConfig[index]?.currencySymbol} ${formatNumberToDigits(
                  item.value
                )}`
              : `${barConfig[index]?.currencySymbol} 0`}
          </Box>
        </Item>
      ))}
      <Item>
        {payload && payload.length > 0
          ? intl.formatDate(payload[0]?.payload?.timestamp * 1000, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : ''}
      </Item>
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
