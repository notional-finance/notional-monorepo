import { Box, styled } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { DrawerTransition, useCurrencyInputRef } from '@notional-finance/mui';
import { useCurrentTradeContext, useTradeContext } from '@notional-finance/notionable-hooks';
import { AssetInput } from '@notional-finance/trade';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { SelectConvertAsset } from './components/select-convert-asset';
import { messages } from './messages';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { PortfolioParams } from '../portfolio-feature-shell';
import { observer } from 'mobx-react-lite';

const ConvertDebt = observer(() => {
  const params = useParams<PortfolioParams>();
  const trade = useCurrentTradeContext();
  const { currencyInputRef } = useCurrencyInputRef();
  const { debt } = trade?.selectedTokens ?? {};

  useEffect(() => {
    if (!debt && params?.selectedCollateralToken) {
      trade?.setDebtByID(params?.selectedCollateralToken);
    }
  }, [trade, debt, params?.selectedCollateralToken]);

  const onBalanceChange = (
    inputAmount: TokenBalance | undefined,
    _: TokenBalance | undefined,
    maxBalance: TokenBalance | undefined
  ) => {
    trade?.setCollateralBalance(
      inputAmount,
      (maxBalance && inputAmount?.eq(maxBalance)) ?? false
    );
  };

  return (
    <DrawerTransition fade={true}>
      {debt && (
        <PortfolioSideDrawer
          enablePrimeBorrow={debt?.tokenType === 'PrimeDebt'}
        >
          <AssetInput
            ref={currencyInputRef}
            debtOrCollateral="Collateral"
            prefillMax
            onBalanceChange={onBalanceChange}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.ROLL_DEBT]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </DrawerTransition>
  );
});

export const RollDebt = observer(() => {
  useTradeContext('RollDebt');
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
      {action === 'convertTo' && <ConvertDebt />}
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
