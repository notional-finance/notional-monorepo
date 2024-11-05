import { styled, Box, useTheme } from '@mui/material';
import {
  LeverageEquals,
  LeveragePlus,
  LeverageTimes,
} from '@notional-finance/icons';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { trackEvent } from '@notional-finance/helpers';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import { CountUp, Label, LabelValue, InfoTooltip } from '@notional-finance/mui';
import { useLocation } from 'react-router-dom';

interface LeverageInforRowProps {
  assetSymbol: string;
  assetAPY?: number;
  apySpread?: number;
  leverage?: number;
}

const LeverageInfoBox = ({
  msg,
  value,
  suffix,
  toolTipText,
}: {
  msg: MessageDescriptor;
  value?: number;
  suffix: string;
  toolTipText?: MessageDescriptor;
}) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  return (
    <LabelBox
      sx={{
        background:
          value && value < 0
            ? theme.palette.error.light
            : theme.palette.info.light,
      }}
    >
      <FormattedMessage {...msg} />
      {toolTipText && (
        <InfoTooltip
          onMouseEnter={() =>
            trackEvent(TRACKING_EVENTS.TOOL_TIP, {
              path: pathname,
              type: TRACKING_EVENTS.HOVER_TOOL_TIP,
              title: 'APY Spread',
            })
          }
          iconColor={theme.palette.typography.accent}
          iconSize={theme.spacing(2)}
          sx={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
          toolTipText={toolTipText}
        />
      )}

      <LabelValue
        sx={{
          marginLeft: theme.spacing(1),
          padding: theme.spacing(0, 1),
          background: theme.palette.common.white,
          borderRadius: theme.shape.borderRadius(),
          border: `1px solid ${
            value && value < 0
              ? theme.palette.error.main
              : theme.palette.primary.accent
          }`,
        }}
      >
        <CountUp value={value} suffix={suffix} decimals={1} />
      </LabelValue>
    </LabelBox>
  );
};

export const LeverageInfoRow = ({
  assetSymbol,
  assetAPY,
  apySpread,
  leverage,
}: LeverageInforRowProps) => {
  const theme = useTheme();
  return (
    <Row>
      <LabelBox
        sx={{
          marginLeft: theme.spacing(0),
        }}
        msg={defineMessage({ defaultMessage: 'Total APY' })}
      />
      <LeverageEquals />
      <LeverageInfoBox
        msg={defineMessage({
          defaultMessage: '{symbol} APY',
          values: { symbol: assetSymbol },
        })}
        value={assetAPY}
        suffix="%"
      />
      <LeveragePlus />
      <LeverageInfoBox
        msg={defineMessage({ defaultMessage: 'APY Spread' })}
        value={apySpread}
        suffix="%"
        toolTipText={defineMessage({
          defaultMessage: 'APY Spread = {symbol} APY - Borrow rate',
          values: { symbol: assetSymbol },
        })}
      />
      <LeverageTimes />
      <LeverageInfoBox
        msg={defineMessage({ defaultMessage: 'Leverage' })}
        value={leverage}
        suffix="x"
      />
    </Row>
  );
};

const Row = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(3)};
  display: flex;
  align-items: center;
  justify-content: space-between;
`
);

const LabelBox = styled(Label)(
  ({ theme }) => `
    padding: ${theme.spacing(1, 1.5)};
    background: ${theme.palette.info.light};
    border-radius: ${theme.shape.borderRadius()};
    display: flex;
    align-items: center;
    color: ${theme.palette.typography.main};
  `
);

export default LeverageInfoRow;
