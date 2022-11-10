import { Header, LaunchAppButton } from '@notional-finance/notional-web'
import { WalletSelector } from '@notional-finance/wallet'
import { trackEvent } from '@notional-finance/utils'

export const HeaderRenderer = ({ pageLayout }) => {
  const handleAppLaunch = () => {
    trackEvent('LINK', 'LANDING_CTA', 'Launch App')
  }

  const renderRightButton = () => {
    return pageLayout === 'landing' ? <LaunchAppButton onLaunch={handleAppLaunch} /> : <WalletSelector />
  }

  return <Header pageLayout={pageLayout} rightButton={renderRightButton()} />
}
