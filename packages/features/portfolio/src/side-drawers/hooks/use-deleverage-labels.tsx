import { Box } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { HeadingSubtitle, Label, InputLabel } from '@notional-finance/mui';
import {
  BaseTradeContext,
  useMaxAssetBalance,
} from '@notional-finance/notionable-hooks';
import { MessageDescriptor, defineMessage } from 'react-intl';

const ValueString = (inputLabel: MessageDescriptor, b?: TokenBalance) => {
  if (!b) return undefined;
  const { title } = formatTokenType(b.token);

  return (
    <Box
      sx={{
        display: 'flex',
        // NOTE: this is the default gutter for HeadingSubtitle
        marginBottom: '0.714rem',
        alignItems: 'end',
      }}
    >
      <HeadingSubtitle msg={inputLabel} />
      <HeadingSubtitle error={b.isNegative()}>
        &nbsp;{b.toDisplayString(2, true)}&nbsp;{title}&nbsp;
      </HeadingSubtitle>
      {/* Line Height is set manually here to compensate for smaller font size */}
      <Label sx={{ lineHeight: 1.6 }}>
        ({b.toFiat('USD').toDisplayStringWithSymbol(3, true)})
      </Label>
    </Box>
  );
};

export function useDeleverageLabels(context: BaseTradeContext) {
  const {
    state: { debt, collateral },
  } = context;
  // NOTE: debt and collateral inputs are reversed in this method on purpose
  const debtBalance = useMaxAssetBalance(collateral);
  const collateralBalance = useMaxAssetBalance(debt);
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
