import { render } from '@testing-library/react';

import ActiveBellIcon from './active-bell-icon';

describe('ActiveBellIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActiveBellIcon />);
    expect(baseElement).toBeTruthy();
  });
});
