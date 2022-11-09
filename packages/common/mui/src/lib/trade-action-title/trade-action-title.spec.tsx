import { render } from '@testing-library/react';

import TradeActionTitle from './trade-action-title';

describe('TradeActionTitle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradeActionTitle />);
    expect(baseElement).toBeTruthy();
  });
});
