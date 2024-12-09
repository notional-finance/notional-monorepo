import { useTradeContext } from '@notional-finance/notionable-hooks';
import { PortfolioParams } from '../portfolio-feature-shell';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { CollateralSelect, DepositInput } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { messages } from './messages';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

export const DepositCollateral = observer(() => {
  const context = useTradeContext('Deposit');
  const { currencyInputRef } = useCurrencyInputRef();
  const { category, sideDrawerKey } = useParams<PortfolioParams>();
  const selectedNetwork = context?.tradeModel?.selectedNetwork;

  return (
    <PortfolioSideDrawer>
      <DepositInput
        showScrollPopper
        inputRef={currencyInputRef}
        newRoute={(newToken) =>
          `/portfolio/${selectedNetwork}/${category}/${sideDrawerKey}/${newToken}`
        }
        inputLabel={messages[PORTFOLIO_ACTIONS.DEPOSIT]['inputLabel']}
      />
      <CollateralSelect
        tightMarginTop
        context={context}
        inputLabel={messages[PORTFOLIO_ACTIONS.DEPOSIT]['inputLabelTwo']}
      />
    </PortfolioSideDrawer>
  );
});
