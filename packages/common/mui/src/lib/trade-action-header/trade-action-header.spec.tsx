import { render } from '@testing-library/react';

import TradeActionHeader from './trade-action-header';

describe('TradeActionHeader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradeActionHeader />);
    expect(baseElement).toBeTruthy();
  });
});
