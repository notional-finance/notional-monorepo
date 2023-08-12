import { Box, styled, useTheme } from '@mui/material';
import { SwapVerticalIcon } from '@notional-finance/icons';
import { H5, InputLabel } from '@notional-finance/mui';
import {
  useMaturitySelect,
  Maturities,
  MaturityCard,
} from '@notional-finance/trade';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  BaseTradeContext,
  MaturityData,
  useCurrency,
} from '@notional-finance/notionable-hooks';

const Container = styled(Box)``;
const SelectorBox = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme.shape.borderStandard};
  background: ${theme.palette.background.default};
  height: ${theme.spacing(20)};
  padding: ${theme.spacing(3, 2)};
`
);

const Variable = defineMessage({ defaultMessage: 'Variable' });
const Fixed = defineMessage({ defaultMessage: 'Fixed' });

export function LeveragedLendMaturitySelector({
  context,
}: {
  context: BaseTradeContext;
}) {
  const theme = useTheme();
  const [isDebtVariable, setDebtVariable] = useState(true);
  const {
    updateState,
    state: { debt, collateral, deposit },
  } = context;
  const { primeCash: allPrimeCash, primeDebt: allPrimeDebt } = useCurrency();
  const { primeDebt, primeCash } = useMemo(() => {
    const primeDebt = allPrimeDebt.find(
      (t) => t.currencyId === deposit?.currencyId
    );
    const primeCash = allPrimeCash.find(
      (t) => t.currencyId === deposit?.currencyId
    );
    return {
      primeCash,
      primeDebt,
    };
  }, [allPrimeDebt, allPrimeCash, deposit]);

  const swapDebtOptions = useCallback(
    (isDebtVariable: boolean) => {
      if (isDebtVariable) {
        updateState({
          debt: primeDebt,
          collateral: undefined,
          debtBalance: undefined,
          debtFee: undefined,
          collateralBalance: undefined,
          collateralFee: undefined,
        });
      } else {
        updateState({
          collateral: primeCash,
          debt: undefined,
          debtBalance: undefined,
          debtFee: undefined,
          collateralBalance: undefined,
          collateralFee: undefined,
        });
      }
    },
    [primeCash, primeDebt, updateState]
  );

  const handleSwapOptions = useCallback(() => {
    setDebtVariable(!isDebtVariable);
    swapDebtOptions(!isDebtVariable);
  }, [setDebtVariable, swapDebtOptions, isDebtVariable]);

  useEffect(() => {
    if (
      (isDebtVariable && debt?.underlying !== deposit?.id) ||
      (!isDebtVariable && collateral?.underlying !== deposit?.id)
    ) {
      // Resets the page to default
      setDebtVariable(true);
      swapDebtOptions(true);
    }
  }, [
    isDebtVariable,
    debt,
    collateral,
    deposit,
    swapDebtOptions,
    setDebtVariable,
  ]);

  const {
    maturityData: debtMaturityData,
    selectedfCashId: selectedDebtId,
    onSelect: onSelectDebt,
  } = useMaturitySelect('Debt', context);

  const {
    maturityData: collateralMaturityData,
    selectedfCashId: selectedCollateralId,
    onSelect: onSelectCollateral,
  } = useMaturitySelect('Collateral', context);

  const lendVariableRate = collateralMaturityData.find(
    (m) => m.maturity === 0
  )?.tradeRate;
  const borrowVariableRate = debtMaturityData.find(
    (m) => m.maturity === 0
  )?.tradeRate;

  return (
    <Container>
      <InputLabel
        inputLabel={defineMessage({ defaultMessage: '2. Select your terms' })}
      />
      <SelectorBox>
        <H5 sx={{ marginBottom: theme.spacing(2) }}>
          <FormattedMessage defaultMessage={'LEND RATE:'} />
          &nbsp;
          <FormattedMessage {...(isDebtVariable ? Fixed : Variable)} />
        </H5>
        {isDebtVariable ? (
          <Maturities
            maturityData={collateralMaturityData.filter((m) => m.maturity > 0)}
            selectedfCashId={selectedCollateralId}
            onSelect={onSelectCollateral}
          />
        ) : (
          <VariableMaturityCard variableRate={lendVariableRate} />
        )}
      </SelectorBox>
      <Box
        onClick={handleSwapOptions}
        sx={{
          cursor: 'pointer',
          margin: theme.spacing(-2, 'auto'),
          position: 'relative',
          background: theme.palette.common.white,
          zIndex: 10,
          boxSizing: 'content-box',
          // Sizing is required to get the SVG to line up with the border
          top: '-2px',
          width: '43.5px',
          height: '43.5px',
        }}
      >
        <SwapVerticalIcon
          sx={{
            fontSize: theme.spacing(6),
            background: theme.palette.background.default,
          }}
        />
      </Box>
      <SelectorBox>
        <H5 sx={{ marginBottom: theme.spacing(2) }}>
          <FormattedMessage defaultMessage={'BORROW RATE:'} />
          &nbsp;
          <FormattedMessage {...(isDebtVariable ? Variable : Fixed)} />
        </H5>
        {isDebtVariable ? (
          <VariableMaturityCard variableRate={borrowVariableRate} />
        ) : (
          <Maturities
            maturityData={debtMaturityData.filter((m) => m.maturity > 0)}
            selectedfCashId={selectedDebtId}
            onSelect={onSelectDebt}
          />
        )}
      </SelectorBox>
    </Container>
  );
}

const VariableMaturityCard = ({
  variableRate,
}: {
  variableRate: number | undefined;
}) => {
  return (
    <MaturityCard
      selected
      isFirstChild
      isLastChild
      isVariable
      onSelect={() => {
        // no-op
        return;
      }}
      maturityData={
        {
          tradeRate: variableRate,
          hasLiquidity: true,
        } as MaturityData
      }
    />
  );
};
