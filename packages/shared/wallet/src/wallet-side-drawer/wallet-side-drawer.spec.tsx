import { render } from '@testing-library/react';
import WalletSideDrawer from './wallet-side-drawer';

describe('WalletSideDrawer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WalletSideDrawer />);
    expect(baseElement).toBeTruthy();
  });
});
