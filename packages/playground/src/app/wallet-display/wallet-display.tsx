import WalletSelector from '../wallet-selector/wallet-selector';
import ConnectWallet from '../connect-wallet/connect-wallet';
import NetworkSelector from '../network-selector/network-selector';
import { useOnboard } from '@notional-finance/notionable';

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
