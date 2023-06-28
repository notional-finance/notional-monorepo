import { Box } from '@mui/material';
import {
  H4,
  Label,
  LabelValue,
  Maturities,
  TabToggle,
} from '@notional-finance/mui';
import { BaseContext } from '@notional-finance/notionable-hooks';
import { useContext, useEffect, useState } from 'react';
import { useMaturitySelect } from './use-maturity-select';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import {
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  formatInterestRate,
} from '@notional-finance/util';

interface ToggleMaturitySelectProps {
  context: BaseContext;
  fCashInputLabel: MessageDescriptor;
}

export function ToggleMaturitySelect({
  context,
  fCashInputLabel,
}: ToggleMaturitySelectProps) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const {
    state: { availableDebtTokens },
    updateState,
  } = useContext(context);

  const { maturityData, selectedfCashId, onSelect } = useMaturitySelect(
    'Debt',
    context
  );

  const primeDebtId = availableDebtTokens?.find(
    (t) =>
      t.tokenType === 'PrimeDebt' || t.maturity === PRIME_CASH_VAULT_MATURITY
  )?.id;

  const lowestFixedRate = maturityData.reduce(
    (r, m) =>
      m.tradeRate !== undefined && (r === undefined || m.tradeRate < r)
        ? m.tradeRate
        : r,
    undefined as number | undefined
  );

  useEffect(() => {
    // TODO: this does not automatically select the correct collateral id
    if (selectedTabIndex === 0 && primeDebtId) onSelect(primeDebtId);
  }, [primeDebtId, selectedTabIndex, onSelect]);

  const VariableRateLabel = (
    <Box>
      <H4 contrast={selectedTabIndex === 0}>
        <FormattedMessage defaultMessage={'Variable Rate'} />
      </H4>
      <LabelValue inline contrast={selectedTabIndex === 0}>
        {'2.23%'}
      </LabelValue>
      &nbsp;
      <Label inline contrast={selectedTabIndex === 0}>
        <FormattedMessage defaultMessage={'Current Rate'} />
      </Label>
    </Box>
  );
  const FixedRateLabel = (
    <Box>
      <H4 contrast={selectedTabIndex === 1}>
        <FormattedMessage defaultMessage={'Fixed Rate'} />
      </H4>
      <Label inline contrast={selectedTabIndex === 1}>
        <FormattedMessage defaultMessage={'As low as'} />
      </Label>
      &nbsp;
      <LabelValue inline contrast={selectedTabIndex === 1}>
        {lowestFixedRate
          ? formatInterestRate(
              Math.floor((lowestFixedRate / 100) * RATE_PRECISION)
            )
          : '??'}
      </LabelValue>
    </Box>
  );
  return (
    <TabToggle
      tabLabels={[VariableRateLabel, FixedRateLabel]}
      tabPanels={[
        <Box />,
        <Maturities
          maturityData={maturityData}
          selectedfCashId={selectedfCashId}
          onSelect={onSelect}
          inputLabel={fCashInputLabel}
        />,
      ]}
      selectedTabIndex={selectedTabIndex}
      onChange={(_, v) => {
        setSelectedTabIndex(v as number);
        if (v === 1) updateState({ selectedDebtToken: undefined });
      }}
    />
  );
}
