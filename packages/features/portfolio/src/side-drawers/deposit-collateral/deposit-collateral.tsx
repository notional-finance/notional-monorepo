import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { CollateralSelect, DepositInput } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { messages } from '../messages';
import { useParams } from 'react-router';

const DepositCollateralContext = createTradeContext('DepositCollateral');

export const DepositCollateral = () => {
  const context = useTradeContext('Deposit');
  const { currencyInputRef } = useCurrencyInputRef();
  const { category, sideDrawerKey } = useParams<PortfolioParams>();

  return (
    <DepositCollateralContext.Provider value={context}>
      <PortfolioSideDrawer
        action={PORTFOLIO_ACTIONS.DEPOSIT}
        context={DepositCollateralContext}
      >
        <DepositInput
          context={DepositCollateralContext}
          inputRef={currencyInputRef}
          newRoute={(newToken) =>
            `/portfolio/${category}/${sideDrawerKey}/${newToken}`
          }
          inputLabel={messages[PORTFOLIO_ACTIONS.DEPOSIT]['inputLabel']}
        />
        <CollateralSelect
          tightMarginTop
          context={DepositCollateralContext}
          inputLabel={messages[PORTFOLIO_ACTIONS.DEPOSIT]['inputLabel']}
        />
      </PortfolioSideDrawer>
    </DepositCollateralContext.Provider>
  );
};
