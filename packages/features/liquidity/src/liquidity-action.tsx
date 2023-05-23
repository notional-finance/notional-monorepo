import { styled, Box } from '@mui/material';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { useLiquidityTransaction } from './store/use-liquidity-transaction';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { LiquiditySummary } from './liquidity-summary/liquidity-summary';
import { LiquiditySidebar } from './liquidity-sidebar/liquidity-sidebar';
import { useObservableContext } from '@notional-finance/notionable-hooks';
import {
  initialLiquidityState,
  LiquidityContext,
} from './store/liquidity-context';
import { loadLiquidityManager } from './store/liquidity-manager';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import backgroundImgDark from '@notional-finance/assets/images/provide-liquidity-bg-alt.png';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import backgroundImgLight from '@notional-finance/assets/images/provide-liquidity-light-bg.png';

const LiquidityCurrencyBackground = styled('img')(
  ({ theme }) => `
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

export const LiquidityCurrencyView = () => {
  const { themeVariant } = useUserSettingsState();
  const liquidityState = useObservableContext(
    initialLiquidityState,
    { currency: { encode: (s) => s, decode: (s) => s } },
    loadLiquidityManager
  );

  const {
    state: { isReady },
  } = liquidityState;

  const txnData = useLiquidityTransaction();
  const showTransactionConfirmation = txnData ? true : false;
  const bgImg =
    themeVariant === THEME_VARIANTS.LIGHT
      ? backgroundImgLight
      : backgroundImgDark;
  const featureLoaded = !!bgImg && isReady;

  return (
    <LiquidityContext.Provider value={liquidityState}>
      <FeatureLoader featureLoaded={featureLoaded}>
        <div>
          <LiquidityCurrencyBackground
            src={bgImg}
            alt="provide liquidity background"
          />
          <Container>
            <SideBarLayout
              showTransactionConfirmation={showTransactionConfirmation}
              sideBar={<LiquiditySidebar />}
              mainContent={<LiquiditySummary />}
            />
          </Container>
        </div>
      </FeatureLoader>
    </LiquidityContext.Provider>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    min-height: 1550px;
    ${theme.breakpoints.down('sm')} {
      min-height: 0px;
    }
    `
);

export default LiquidityCurrencyView;
