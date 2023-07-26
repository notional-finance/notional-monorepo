import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { PortfolioSideDrawer } from './portfolio-side-drawer';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { PortfolioParams } from '@notional-finance/side-drawer';
import { useParams } from 'react-router';
import { DepositInput, PortfolioHoldingSelect } from '@notional-finance/trade';
import { messages } from '../messages';

const WithdrawContext = createTradeContext('Withdraw');

export const Withdraw = () => {
  const context = useTradeContext('Withdraw');
  const { currencyInputRef } = useCurrencyInputRef();
  const { category, sideDrawerKey } = useParams<PortfolioParams>();

  return (
    <WithdrawContext.Provider value={context}>
      <PortfolioSideDrawer
        action={PORTFOLIO_ACTIONS.WITHDRAW}
        context={WithdrawContext}
      >
        <PortfolioHoldingSelect
          tightMarginTop
          isWithdraw
          context={WithdrawContext}
          inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW]['inputLabel']}
          filterBalances={(b) =>
            b.isPositive() &&
            (b.tokenType === 'PrimeCash' ||
              b.tokenType === 'fCash' ||
              b.tokenType === 'nToken')
          }
        />
        <DepositInput
          isWithdraw
          context={WithdrawContext}
          inputRef={currencyInputRef}
          newRoute={(newToken) =>
            `/portfolio/${category}/${sideDrawerKey}/${newToken}`
          }
          inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW]['inputLabel']}
        />
      </PortfolioSideDrawer>
    </WithdrawContext.Provider>
  );
};
