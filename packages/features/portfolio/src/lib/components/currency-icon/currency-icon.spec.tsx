import { render } from '@testing-library/react';

import CurrencyIcon from './currency-icon';

describe('SupportedCurrencies', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CurrencyIcon />);
    expect(baseElement).toBeTruthy();
  });
});
