import { useEffect } from 'react';
import { styled, Box } from '@mui/material';
import { SideBarLayout } from '@notional-finance/mui';
import { useParams } from 'react-router-dom';
import { trimRouterMatchToPath } from '@notional-finance/helpers';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import backgroundImgDark from '@notional-finance/assets/images/provide-liquidity-bg-alt.png';
import backgroundImgLight from '@notional-finance/assets/images/provide-liquidity-light-bg.png';
import { useUserSettingsState } from '@notional-finance/notional-web';
import { LiquiditySummary } from './liquidity-summary/liquidity-summary';
import { LiquiditySidebar } from './liquidity-sidebar/liquidity-sidebar';
import { updateLiquidityState } from './store/liquidity-store';

const LiquidityCurrencyBackground = styled('img')`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

export const LiquidityCurrencyView = () => {
  const { themeVariant } = useUserSettingsState();
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

  return (
    <>
      <LiquidityCurrencyBackground
        src={bgImg}
        alt="provide liquidity background"
      />
      <Box sx={{ minHeight: '1550px' }}>
        <SideBarLayout
          sideBar={<LiquiditySidebar />}
          mainContent={<LiquiditySummary />}
        />
      </Box>
    </>
  );
};

export default LiquidityCurrencyView;
