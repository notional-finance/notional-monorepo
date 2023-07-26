import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { DepositInput } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { messages } from './messages';
import { SelectConvertAsset } from './components/select-convert-asset';

const ConvertAssetContext = createTradeContext('ConvertAsset');

export const ConvertAsset = () => {
  const context = useTradeContext('ConvertAsset');
  const { currencyInputRef } = useCurrencyInputRef();
  // TODO: withdraw, convert asset, repay debt, roll debt need to take a selection
  // via the route parameter.
  // TODO: need to make the manage maturities screen two stage and switch the stage
  // inside this screen based on the selection, not sure if this is possible via
  // route selection

  // NOTE: this is a two step screen:
  //  1. the "debt" asset is selected via URL route and presents the convert
  //     selection screen with all the options provided. the "collateral" asset
  //     is selected on this screen
  //  2. the max amount of collateral asset is set as the default on the second
  //     screen via the deposit input (this is precalculated)
  const {
    state: { collateral },
  } = context;

  return (
    <ConvertAssetContext.Provider value={context}>
      {collateral === undefined ? (
        <SelectConvertAsset context={ConvertAssetContext} />
      ) : (
        <PortfolioSideDrawer
          action={PORTFOLIO_ACTIONS.DEPOSIT}
          context={ConvertAssetContext}
        >
          <DepositInput
            isWithdraw
            context={ConvertAssetContext}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </ConvertAssetContext.Provider>
  );
};
