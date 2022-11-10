import { render } from '@testing-library/react';

import TabToggle from './tab-toggle';

describe('TabToggle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TabToggle />);
    expect(baseElement).toBeTruthy();
  });
});
