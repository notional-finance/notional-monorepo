import { render } from '@testing-library/react';

import PortfolioMobileNav from './portfolio-mobile-nav';

describe('PortfolioMobileNav', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PortfolioMobileNav />);
    expect(baseElement).toBeTruthy();
  });
});
