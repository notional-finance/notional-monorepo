import { render } from '@testing-library/react';

import WalletDisplay from './wallet-display';

describe('WalletDisplay', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WalletDisplay />);
    expect(baseElement).toBeTruthy();
  });
});
