import { render } from '@testing-library/react';

import EnabledCurrencies from './enabled-currencies';

describe('EnabledCurrencies', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnabledCurrencies />);
    expect(baseElement).toBeTruthy();
  });
});
