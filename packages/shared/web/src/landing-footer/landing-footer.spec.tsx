import { render } from '@testing-library/react';

import LandingFooter from './landing-footer';

describe('LandingFooter', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LandingFooter />);
    expect(baseElement).toBeTruthy();
  });
});
