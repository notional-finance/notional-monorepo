import { render } from '@testing-library/react';
import WalletSwitcher from './wallet-switcher';

describe('WalletSwitcher', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WalletSwitcher />);
    expect(baseElement).toBeTruthy();
  });
});
