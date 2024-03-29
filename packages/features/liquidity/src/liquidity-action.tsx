import { useEffect } from 'react';
import { styled, Box } from '@mui/material';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import { useParams } from 'react-router-dom';
import { trimRouterMatchToPath } from '@notional-finance/helpers';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import backgroundImgDark from '@notional-finance/assets/images/provide-liquidity-bg-alt.png';
import backgroundImgLight from '@notional-finance/assets/images/provide-liquidity-light-bg.png';
import { useLiquidityTransaction } from './store/use-liquidity-transaction';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { LiquiditySummary } from './liquidity-summary/liquidity-summary';
import { LiquiditySidebar } from './liquidity-sidebar/liquidity-sidebar';
import { updateLiquidityState } from './store/liquidity-store';

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
  const txnData = useLiquidityTransaction();
  const showTransactionConfirmation = txnData ? true : false;
  const bgImg =
    themeVariant === THEME_VARIANTS.LIGHT
      ? backgroundImgLight
      : backgroundImgDark;
  const { currency } = useParams<Record<string, string>>();
  const symbol = trimRouterMatchToPath(currency);

  useEffect(() => {
    if (symbol) {
      updateLiquidityState({ selectedToken: symbol });
    }
  }, [symbol]);

  const featureLoaded = bgImg ? true : false;

  return (
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
