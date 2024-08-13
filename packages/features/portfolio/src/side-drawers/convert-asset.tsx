import { Box, styled } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { DrawerTransition, useCurrencyInputRef } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { AssetInput } from '@notional-finance/trade';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { SelectConvertAsset } from './components/select-convert-asset';
import { useConvertOptions } from './hooks/use-convert-options';
import { messages } from './messages';
import { useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router';
import { PortfolioParams } from '../portfolio-feature-shell';

const ConvertCollateral = () => {
  const params = useParams<PortfolioParams>();
  const context = useTradeContext('ConvertAsset');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    updateState,
    state: { collateralOptions, debt, collateral },
  } = context;
  const { initialConvertFromBalance: balance } = useConvertOptions(
    context.state
  );
  const selectedCollateral = collateralOptions?.find(
    ({ token }) => token.id === params?.selectedCollateralToken
  );

  useEffect(() => {
    if (!debt) {
      updateState({ debtBalance: balance, debt: balance?.token });
    } else if (!collateral && selectedCollateral) {
      updateState({ collateral: selectedCollateral.token });
    }
  }, [debt, balance, updateState, collateral, selectedCollateral]);

  const onBalanceChange = (
    inputAmount: TokenBalance | undefined,
    _: TokenBalance | undefined,
    maxBalance: TokenBalance | undefined
  ) => {
    updateState({
      debtBalance: inputAmount,
      maxWithdraw: maxBalance && inputAmount?.neg().eq(maxBalance),
    });
  };

  return (
    <DrawerTransition fade={true}>
      {collateral && (
        <PortfolioSideDrawer context={context}>
          <AssetInput
            ref={currencyInputRef}
            debtOrCollateral="Debt"
            prefillMax
            onBalanceChange={onBalanceChange}
            context={context}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </DrawerTransition>
  );
};

export const ConvertAsset = () => {
  const context = useTradeContext('ConvertAsset');
  const {
    updateState,
    state: { debt },
  } = context;
  const { initialConvertFromBalance: balance } = useConvertOptions(
    context.state
  );

  useEffect(() => {
    if (!debt) {
      updateState({ debtBalance: balance, debt: balance?.token });
    }
  }, [debt, balance, updateState]);

  return (
    <Container>
      <Routes>
        <Route
          path={`/portfolio/:selectedNetwork/:category/${PORTFOLIO_ACTIONS.CONVERT_ASSET}/:selectedToken/manage`}
        >
          <DrawerTransition fade={true}>
            <Wrapper>
              <SelectConvertAsset context={context} />
            </Wrapper>
          </DrawerTransition>
        </Route>
        <Route
          path={`/portfolio/:selectedNetwork/:category/${PORTFOLIO_ACTIONS.CONVERT_ASSET}/:selectedToken/convertTo/:selectedCollateralToken`}
        >
          <ConvertCollateral />
        </Route>
      </Routes>
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
