import { Box } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { HeadingSubtitle, Label, InputLabel } from '@notional-finance/mui';
import {
  BaseTradeContext,
  useBalance,
} from '@notional-finance/notionable-hooks';
import { MessageDescriptor, defineMessage } from 'react-intl';

const ValueString = (inputLabel: MessageDescriptor, b?: TokenBalance) => {
  if (!b) return undefined;
  const { title } = formatTokenType(b.token);

  return (
    <Box
      sx={{
        display: 'flex',
        lineHeight: '1',
        // NOTE: margin bottom is set to 1 rem to account for removing the line height
        // of 1.4 and the default gutter size. This is required since the font sizes
        // are different and therefore the line heights are not the same.
        marginBottom: '1rem',
        alignItems: 'end',
      }}
    >
      <HeadingSubtitle msg={inputLabel} />
      <HeadingSubtitle error={b.isNegative()}>
        &nbsp;{b.toDisplayString(2, true)}&nbsp;{title}&nbsp;
      </HeadingSubtitle>
      <Label>({b.toFiat('USD').toDisplayStringWithSymbol(3, true)})</Label>
    </Box>
  );
};

export function useDeleverageLabels(context: BaseTradeContext) {
  const {
    state: { debt, collateral },
  } = context;
  // NOTE: debt and collateral inputs are reversed in this method on purpose
  const debtBalance = useBalance(collateral?.symbol);
  const collateralBalance = useBalance(debt?.symbol);
  const debtValue = ValueString(
    defineMessage({
      defaultMessage: 'Selected Debt:',
    }),
    debtBalance
  );
  const collateralValue = ValueString(
    defineMessage({
      defaultMessage: 'Selected Collateral:',
    }),
    collateralBalance
  );

  const debtStateZero = (
    <InputLabel
      inputLabel={defineMessage({ defaultMessage: 'Debt to Repay' })}
    />
  );
  const collateralStateZero = (
    <InputLabel
      inputLabel={defineMessage({ defaultMessage: 'Collateral to Sell' })}
    />
  );

  return {
    debtInputLabel: debtValue || debtStateZero,
    collateralInputLabel: collateralValue || collateralStateZero,
  };
}
