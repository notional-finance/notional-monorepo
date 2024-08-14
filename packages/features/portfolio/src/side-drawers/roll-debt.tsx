import { Box, styled } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { DrawerTransition, useCurrencyInputRef } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { AssetInput } from '@notional-finance/trade';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { SelectConvertAsset } from './components/select-convert-asset';
import { messages } from './messages';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useConvertOptions } from './hooks/use-convert-options';
import { PortfolioParams } from '../portfolio-feature-shell';

const ConvertDebt = () => {
  const params = useParams<PortfolioParams>();
  const context = useTradeContext('RollDebt');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    state: { debtOptions, debt, collateral },
    updateState,
  } = context;
  const { initialConvertFromBalance: balance } = useConvertOptions(
    context.state
  );

  const selectedDebt = debtOptions?.find(
    ({ token }) => token.id === params?.selectedCollateralToken
  );

  useEffect(() => {
    if (!collateral) {
      updateState({ collateralBalance: balance, collateral: balance?.token });
    } else if (!debt && selectedDebt) {
      updateState({ debt: selectedDebt.token });
    }
  }, [debt, balance, updateState, collateral, selectedDebt]);

  const onBalanceChange = (
    inputAmount: TokenBalance | undefined,
    _: TokenBalance | undefined,
    maxBalance: TokenBalance | undefined
  ) => {
    updateState({
      collateralBalance: inputAmount,
      maxWithdraw: maxBalance && inputAmount?.eq(maxBalance),
    });
  };

  return (
    <DrawerTransition fade={true}>
      {debt && (
        <PortfolioSideDrawer
          context={context}
          enablePrimeBorrow={debt?.tokenType === 'PrimeDebt'}
        >
          <AssetInput
            ref={currencyInputRef}
            debtOrCollateral="Collateral"
            context={context}
            prefillMax
            onBalanceChange={onBalanceChange}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.ROLL_DEBT]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </DrawerTransition>
  );
};

export const RollDebt = () => {
  const context = useTradeContext('RollDebt');
  const { action } = useParams<PortfolioParams>();
  const {
    updateState,
    state: { collateral },
  } = context;
  const { initialConvertFromBalance: balance } = useConvertOptions(
    context.state
  );

  useEffect(() => {
    if (!collateral) {
      updateState({ collateralBalance: balance, collateral: balance?.token });
    }
  }, [collateral, balance, updateState]);

  return (
    <Container>
      {action === 'manage' && (
        <DrawerTransition fade={true}>
          <Wrapper>
            <SelectConvertAsset context={context} />
          </Wrapper>
        </DrawerTransition>
      )}
      {action === 'convertTo' && <ConvertDebt />}
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        width: 100vw;
      }
    `
);
const Wrapper = styled(Box)(
  ({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        width: 90%;
        margin: auto;
      }
    `
);
