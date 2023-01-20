import { render } from '@testing-library/react';
import VaultSubNav from './vault-sub-nav';

describe('VaultSubNav', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VaultSubNav />);
    expect(baseElement).toBeTruthy();
  });
});
