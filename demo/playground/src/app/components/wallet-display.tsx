import { useOnboard } from '@notional-finance/notionable';
import WalletSelector from './wallet-selector';
import ConnectWallet from './connect-wallet';
import NetworkSelector from './network-selector';

export function WalletDisplay() {
  const { connected } = useOnboard();

  return connected ? (
    <WalletSelector />
  ) : (
    <>
      <ConnectWallet />
      <NetworkSelector />
    </>
  );
}

export default WalletDisplay;
