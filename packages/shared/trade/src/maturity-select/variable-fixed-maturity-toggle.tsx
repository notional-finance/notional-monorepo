import { Box } from '@mui/material';
import {
  InputLabel,
  Label,
  LabelValue,
  TabToggle,
  CountUp,
  ErrorMessage,
} from '@notional-finance/mui';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { Maturities } from './components/maturities';
import { useEffect, useState } from 'react';
import { useMaturitySelect } from './use-maturity-select';
import { findTradeRate } from './use-maturity-select';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import {
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  formatInterestRate,
} from '@notional-finance/util';
import { tradeErrors } from '../tradeErrors';

interface ToggleMaturitySelectProps {
  context: BaseTradeContext;
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
  const [selectedTabIndex, setSelectedTabIndex] = useState(VARIABLE);
  const {
    state: { debt },
  } = context;

  const { maturityData, selectedfCashId, onSelect } = useMaturitySelect(
    'Debt',
    context
  );

  const fixedMaturities = maturityData.filter(
    (m) =>
      m.token.tokenType === 'fCash' ||
      (m.token.tokenType === 'VaultDebt' &&
        m.maturity !== PRIME_CASH_VAULT_MATURITY)
  );

  const lowestFixedRate = fixedMaturities.reduce(
    (r, m) =>
      m.tradeRate !== undefined && (r === undefined || m.tradeRate < r)
        ? m.tradeRate
        : r,
    undefined as number | undefined
  );

  /** Handle the toggle selection */
  const primeDebt = maturityData.find(
    (m) =>
      m.token.tokenType === 'PrimeDebt' ||
      m.maturity === PRIME_CASH_VAULT_MATURITY
  );
  const primeDebtId = primeDebt?.tokenId;
  const debtId = debt?.id;
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
        {primeDebt?.tradeRate ? (
          <CountUp value={primeDebt?.tradeRate} suffix="%" decimals={2} />
        ) : (
          '-'
        )}
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
      {lowestFixedRate !== undefined ? (
        <>
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
            {formatInterestRate(
              Math.floor((lowestFixedRate / 100) * RATE_PRECISION)
            )}
          </LabelValue>
        </>
      ) : (
        <LabelValue
          inline
          contrast={selectedTabIndex === FIXED}
          sx={inheritTransition}
        >
          <FormattedMessage defaultMessage={'Insufficient Liquidity'} />
        </LabelValue>
      )}
    </Box>
  );
  return (
    <Box>
      <InputLabel
        inputLabel={defineMessage({
          defaultMessage: 'Select variable or fixed borrow',
        })}
      />
      <TabToggle
        tabLabels={[VariableRateLabel, FixedRateLabel]}
        tabPanels={[
          <Box key="empty" />,
          <Box key="maturity">
            <Maturities
              maturityData={fixedMaturities}
              selectedfCashId={selectedfCashId}
              defaultfCashId={
                findTradeRate(fixedMaturities, 'min')?.tokenId || ''
              }
              onSelect={onSelect}
              inputLabel={fCashInputLabel}
            />
            {lowestFixedRate === undefined && (
              <ErrorMessage
                variant="info"
                title={
                  <FormattedMessage
                    {...tradeErrors.insufficientFixedRateLiquidity}
                  />
                }
                message={
                  <FormattedMessage
                    {...tradeErrors.insufficientFixedRateLiquidityMsg}
                  />
                }
              />
            )}
          </Box>,
        ]}
        selectedTabIndex={selectedTabIndex}
        onChange={(_, v) => {
          setSelectedTabIndex(v as number);
        }}
      />
    </Box>
  );
}
