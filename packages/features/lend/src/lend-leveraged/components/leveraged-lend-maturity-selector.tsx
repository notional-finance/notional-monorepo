import { Box, styled, useTheme } from '@mui/material';
import { SwapVerticalIcon } from '@notional-finance/icons';
import {
  H5,
  InputLabel,
  Maturities,
  MaturityCard,
} from '@notional-finance/mui';
import { MaturityData } from '@notional-finance/notionable';
import { BaseContext } from '@notional-finance/notionable-hooks';
import { useMaturitySelect } from '@notional-finance/trade';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';

interface LeveragedLendMaturitySelectorProps {
  context: BaseContext;
}

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

const VariableMaturityCard = ({ variableRate }: { variableRate: number }) => {
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

export function LeveragedLendMaturitySelector({
  context,
}: LeveragedLendMaturitySelectorProps) {
  const theme = useTheme();
  const [isDebtVariable, setDebtVariable] = useState(true);
  const {
    updateState,
    state: {
      availableDebtTokens,
      availableCollateralTokens,
      debt,
      collateral,
      deposit,
    },
  } = useContext(context);
  const primeDebt = availableDebtTokens?.find(
    (t) => t.tokenType === 'PrimeDebt'
  );
  const primeCash = availableCollateralTokens?.find(
    (t) => t.tokenType === 'PrimeCash'
  );

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
            maturityData={collateralMaturityData}
            selectedfCashId={selectedCollateralId}
            onSelect={onSelectCollateral}
          />
        ) : (
          <VariableMaturityCard variableRate={2.23} />
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
          <VariableMaturityCard variableRate={2.23} />
        ) : (
          <Maturities
            maturityData={debtMaturityData}
            selectedfCashId={selectedDebtId}
            onSelect={onSelectDebt}
          />
        )}
      </SelectorBox>
    </Container>
  );
}
