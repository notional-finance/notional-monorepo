import { Header, LaunchAppButton } from '@notional-finance/shared-web';
import { WalletSelector } from '@notional-finance/wallet';
import { trackEvent } from '@notional-finance/helpers';
import { useLocation } from 'react-router-dom';

export const HeaderRenderer = () => {
  const { pathname } = useLocation();
  const handleAppLaunch = () => {
    trackEvent('LAUNCH_APP');
  };

  const renderRightButton = () => {
    return pathname === '/' ? (
      <LaunchAppButton onLaunch={handleAppLaunch} />
    ) : (
      <WalletSelector />
    );
  };

  return <Header rightButton={renderRightButton()} />;
};
