import { render } from '@testing-library/react';

import CurrencyInput from './currency-input';

describe('currency-input', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CurrencyInput />);
    expect(baseElement).toBeTruthy();
  });
});
