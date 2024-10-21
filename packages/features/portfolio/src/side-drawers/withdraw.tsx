import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import {
  useTradeContext,
  useQueryParams,
} from '@notional-finance/notionable-hooks';
import { PortfolioParams } from '../portfolio-feature-shell';
import { useLocation, useParams } from 'react-router';
import { ErrorMessage } from '@notional-finance/mui';
import {
  DepositInput,
  PortfolioHoldingSelect,
  useMaxWithdraw,
} from '@notional-finance/trade';
import { messages } from './messages';
import { FormattedMessage } from 'react-intl';
import { useEffect } from 'react';
import { TableActionRowWarning } from '../components';

export const Withdraw = () => {
  const context = useTradeContext('Withdraw');
  const { category, sideDrawerKey } = useParams<PortfolioParams>();
  const { pathname } = useLocation();
  const search = useQueryParams();
  const warning = search.get('warning') as TableActionRowWarning | undefined;

  const {
    currencyInputRef,
    setCurrencyInput,
    onMaxValue,
    maxWithdrawUnderlying,
    belowMaxWarning,
  } = useMaxWithdraw(context);
  const {
    state: { selectedNetwork },
  } = context;

  useEffect(() => {
    setCurrencyInput('');
    // Ignore the setCurrencyInput dependency here, causes race conditions
    // as the callback is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <PortfolioSideDrawer context={context} isWithdraw>
      <PortfolioHoldingSelect
        isWithdraw
        context={context}
        inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW]['inputLabelTwo']}
      />
      <DepositInput
        isWithdraw
        ref={currencyInputRef}
        context={context}
        inputRef={currencyInputRef}
        maxWithdraw={maxWithdrawUnderlying}
        warningMsg={belowMaxWarning}
        onMaxValue={onMaxValue}
        newRoute={(newToken) =>
          `/portfolio/${selectedNetwork}/${category}/${sideDrawerKey}/${newToken}`
        }
        inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW]['inputLabel']}
      />
      {warning && (
        <ErrorMessage
          variant="warning"
          title={<FormattedMessage {...messages[warning]['title']} />}
          message={<FormattedMessage {...messages[warning]['message']} />}
          maxWidth={'100%'}
        />
      )}
    </PortfolioSideDrawer>
  );
};
