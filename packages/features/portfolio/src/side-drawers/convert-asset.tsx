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
import { useParams } from 'react-router';
import { PortfolioParams } from '../portfolio-feature-shell';
import { observer } from 'mobx-react-lite';

const ConvertCollateral = () => {
  const params = useParams<PortfolioParams>();
  const context = useTradeContext('ConvertAsset');
  const { currencyInputRef } = useCurrencyInputRef();
  const { debt, collateral } = context?.tradeModel?.selectedTokens ?? {};
  const { collateral: collateralOptions } =
    context.tradeModel?.computedOptions ?? {};
  const { initialConvertFromBalance: balance } = useConvertOptions();
  const selectedCollateral = collateralOptions?.find(
    ({ token }) => token.id === params?.selectedCollateralToken
  );

  useEffect(() => {
    if (!debt && balance) {
      context?.tradeModel?.setInitialConvertAsset(balance);
    } else if (!collateral && selectedCollateral) {
      context?.tradeModel?.setCollateralByID(selectedCollateral.token.id);
    }
  }, [debt, balance, context, collateral, selectedCollateral]);

  const onBalanceChange = (
    inputAmount: TokenBalance | undefined,
    _: TokenBalance | undefined,
    maxBalance: TokenBalance | undefined
  ) => {
    context?.tradeModel?.setDebtBalance(
      inputAmount,
      (maxBalance && inputAmount?.neg().eq(maxBalance)) ?? false
    );
  };

  return (
    <DrawerTransition fade={true}>
      {collateral && (
        <PortfolioSideDrawer>
          <AssetInput
            ref={currencyInputRef}
            debtOrCollateral="Debt"
            prefillMax
            onBalanceChange={onBalanceChange}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </DrawerTransition>
  );
};

export const ConvertAsset = observer(() => {
  // This is here to set the trade context
  useTradeContext('ConvertAsset');
  const { action } = useParams<PortfolioParams>();

  return (
    <Container>
      {action === 'manage' && (
        <DrawerTransition fade={true}>
          <Wrapper>
            <SelectConvertAsset />
          </Wrapper>
        </DrawerTransition>
      )}
      {action === 'convertTo' && <ConvertCollateral />}
    </Container>
  );
});

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
