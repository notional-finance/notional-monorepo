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
import { useCallback, useContext, useState } from 'react';
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
    state: { availableDebtTokens, availableCollateralTokens },
  } = useContext(context);

  const handleSwapOptions = useCallback(() => {
    if (!isDebtVariable) {
      updateState({
        selectedDebtToken: availableDebtTokens?.find(
          (t) => t.tokenType === 'PrimeDebt'
        )?.symbol,
        selectedCollateralToken: undefined,
      });
    } else {
      updateState({
        selectedDebtToken: undefined,
        selectedCollateralToken: availableCollateralTokens?.find(
          (t) => t.tokenType === 'PrimeCash'
        )?.symbol,
      });
    }
    setDebtVariable(!isDebtVariable);
  }, [
    setDebtVariable,
    isDebtVariable,
    availableCollateralTokens,
    availableDebtTokens,
    updateState,
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
