import { useTradeContext } from '@notional-finance/notionable-hooks';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { AssetInput } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { messages } from './messages';
import { SelectConvertAsset } from './components/select-convert-asset';

export const ConvertAsset = () => {
  const context = useTradeContext('ConvertAsset');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    state: { collateral },
  } = context;

  return collateral === undefined ? (
    <SelectConvertAsset context={context} />
  ) : (
    <PortfolioSideDrawer context={context}>
      <AssetInput
        ref={currencyInputRef}
        prefillMax
        debtOrCollateral="Debt"
        context={context}
        inputRef={currencyInputRef}
        inputLabel={messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['inputLabel']}
      />
    </PortfolioSideDrawer>
  );
};
