import { render } from '@testing-library/react';

import CoinsIcon from './coins-icon';

describe('CoinsIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CoinsIcon />);
    expect(baseElement).toBeTruthy();
  });
});
