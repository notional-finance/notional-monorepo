import { render } from '@testing-library/react';

import NetworkSelector from './network-selector';

describe('NetworkSelector', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NetworkSelector />);
    expect(baseElement).toBeTruthy();
  });
});
