import { render } from '@testing-library/react';

import TokenIcon from './token-icon';

describe('TokenIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TokenIcon />);
    expect(baseElement).toBeTruthy();
  });
});
