import { styled, Box, useTheme } from '@mui/material';
import {
  LeverageEquals,
  LeveragePlus,
  LeverageTimes,
} from '@notional-finance/icons';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import { CountUp, Label, LabelValue } from '@notional-finance/mui';

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
}: {
  msg: MessageDescriptor;
  value?: number;
  suffix: string;
}) => {
  const theme = useTheme();
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
        marginLeft={theme.spacing(0)}
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
`
);

const LabelBox = styled(Label)(
  ({ theme }) => `
    margin-right: ${theme.spacing(1)};
    margin-left: ${theme.spacing(1)};
    padding: ${theme.spacing(1, 1.5)};
    background: ${theme.palette.info.light};
    border-radius: ${theme.shape.borderRadius()};
    display: flex;
    align-items: center;
    color: ${theme.palette.typography.main};
  `
);

export default LeverageInfoRow;
