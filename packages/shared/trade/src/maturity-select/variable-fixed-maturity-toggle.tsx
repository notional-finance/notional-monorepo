import { Box } from '@mui/material';
import {
  InputLabel,
  Label,
  LabelValue,
  Maturities,
  TabToggle,
} from '@notional-finance/mui';
import { BaseContext } from '@notional-finance/notionable-hooks';
import { useContext, useEffect, useState } from 'react';
import { useMaturitySelect } from './use-maturity-select';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import {
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  formatInterestRate,
} from '@notional-finance/util';

interface ToggleMaturitySelectProps {
  context: BaseContext;
  fCashInputLabel?: MessageDescriptor;
}

const VARIABLE = 0;
const FIXED = 1;

export function VariableFixedMaturityToggle({
  context,
  fCashInputLabel = defineMessage({
    defaultMessage: 'Select a maturity for your fixed borrow rate',
  }),
}: ToggleMaturitySelectProps) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const {
    state: { availableDebtTokens, debt },
  } = useContext(context);

  const { maturityData, selectedfCashId, onSelect } = useMaturitySelect(
    'Debt',
    context
  );

  const primeDebtId = availableDebtTokens?.find(
    (t) =>
      t.tokenType === 'PrimeDebt' || t.maturity === PRIME_CASH_VAULT_MATURITY
  )?.id;
  const debtId = debt?.id;

  const lowestFixedRate = maturityData.reduce(
    (r, m) =>
      m.tradeRate !== undefined && (r === undefined || m.tradeRate < r)
        ? m.tradeRate
        : r,
    undefined as number | undefined
  );

  useEffect(() => {
    if (
      selectedTabIndex === VARIABLE &&
      primeDebtId &&
      debtId !== primeDebtId
    ) {
      onSelect(primeDebtId);
    } else if (selectedTabIndex === FIXED && debtId === primeDebtId) {
      onSelect(undefined);
    }
  }, [primeDebtId, selectedTabIndex, onSelect, debtId]);

  // NOTE: transition delay matches the delay on the tab switcher so the text
  // does not flash
  const inheritTransition = {
    transitionDelay: 'inherit',
    transitionDuration: 'inherit',
    transitionProperty: 'color',
  };

  const VariableRateLabel = (
    <Box sx={inheritTransition}>
      <LabelValue
        contrast={selectedTabIndex === VARIABLE}
        sx={inheritTransition}
      >
        <FormattedMessage defaultMessage={'Variable Rate'} />
      </LabelValue>
      <LabelValue
        inline
        contrast={selectedTabIndex === VARIABLE}
        sx={inheritTransition}
      >
        {'2.23%'}
      </LabelValue>
      &nbsp;
      <Label
        inline
        contrast={selectedTabIndex === VARIABLE}
        sx={inheritTransition}
      >
        <FormattedMessage defaultMessage={'Current Rate'} />
      </Label>
    </Box>
  );
  const FixedRateLabel = (
    <Box sx={inheritTransition}>
      <LabelValue contrast={selectedTabIndex === FIXED} sx={inheritTransition}>
        <FormattedMessage defaultMessage={'Fixed Rate'} />
      </LabelValue>
      <Label
        inline
        contrast={selectedTabIndex === FIXED}
        sx={inheritTransition}
      >
        <FormattedMessage defaultMessage={'As low as'} />
      </Label>
      &nbsp;
      <LabelValue
        inline
        contrast={selectedTabIndex === FIXED}
        sx={inheritTransition}
      >
        {lowestFixedRate
          ? formatInterestRate(
              Math.floor((lowestFixedRate / 100) * RATE_PRECISION)
            )
          : '??'}
      </LabelValue>
    </Box>
  );
  return (
    <Box>
      <InputLabel
        inputLabel={defineMessage({
          defaultMessage: '2. Select variable or fixed borrow',
        })}
      />
      <TabToggle
        tabLabels={[VariableRateLabel, FixedRateLabel]}
        tabPanels={[
          <Box />,
          <Maturities
            maturityData={maturityData.filter(
              (t) => !!t.maturity && t.maturity < PRIME_CASH_VAULT_MATURITY
            )}
            selectedfCashId={selectedfCashId}
            onSelect={onSelect}
            inputLabel={fCashInputLabel}
          />,
        ]}
        selectedTabIndex={selectedTabIndex}
        onChange={(_, v) => {
          setSelectedTabIndex(v as number);
        }}
      />
    </Box>
  );
}
