import { render } from '@testing-library/react';

import ConnectWallet from './connect-wallet';

describe('ConnectWallet', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ConnectWallet />);
    expect(baseElement).toBeTruthy();
  });
});
