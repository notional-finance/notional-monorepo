import { render } from '@testing-library/react';

import BellIcon from './bell-icon';

describe('BellIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BellIcon />);
    expect(baseElement).toBeTruthy();
  });
});
