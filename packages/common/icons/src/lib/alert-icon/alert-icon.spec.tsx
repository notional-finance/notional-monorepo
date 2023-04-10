import { render } from '@testing-library/react';

import AlertIcon from './alert-icon';

describe('AlertIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AlertIcon />);
    expect(baseElement).toBeTruthy();
  });
});
