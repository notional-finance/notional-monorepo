import { render } from '@testing-library/react';

import TradeActionButton from './trade-action-button';

describe('TradeActionButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradeActionButton />);
    expect(baseElement).toBeTruthy();
  });
});
