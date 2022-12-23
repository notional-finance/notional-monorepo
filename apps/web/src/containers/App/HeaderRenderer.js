import { Header, LaunchAppButton } from '@notional-finance/shared-web';
import { WalletSelector } from '@notional-finance/wallet';
import { trackEvent } from '@notional-finance/helpers';

export const HeaderRenderer = ({ pageLayout }) => {
  const handleAppLaunch = () => {
    trackEvent('LAUNCH_APP');
  };

  const renderRightButton = () => {
    return pageLayout === 'landing' ? (
      <LaunchAppButton onLaunch={handleAppLaunch} />
    ) : (
      <WalletSelector />
    );
  };

  return <Header pageLayout={pageLayout} rightButton={renderRightButton()} />;
};
