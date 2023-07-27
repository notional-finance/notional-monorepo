import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { AssetInput } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { messages } from './messages';
import { SelectConvertAsset } from './components/select-convert-asset';

const RollDebtContext = createTradeContext('RollDebt');

export const RollDebt = () => {
  const context = useTradeContext('RollDebt');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    state: { debt },
  } = context;

  return (
    <RollDebtContext.Provider value={context}>
      {debt === undefined ? (
        <SelectConvertAsset context={RollDebtContext} />
      ) : (
        <PortfolioSideDrawer
          action={PORTFOLIO_ACTIONS.ROLL_DEBT}
          context={RollDebtContext}
        >
          <AssetInput
            ref={currencyInputRef}
            prefillMax
            debtOrCollateral="Collateral"
            context={RollDebtContext}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.ROLL_DEBT]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </RollDebtContext.Provider>
  );
};
