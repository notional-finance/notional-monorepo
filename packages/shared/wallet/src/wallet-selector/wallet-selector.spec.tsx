import { render } from '@testing-library/react';

import WalletSelector from './wallet-selector';

describe('WalletSelector', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WalletSelector />);
    expect(baseElement).toBeTruthy();
  });
});
