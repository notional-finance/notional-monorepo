import { render } from '@testing-library/react';

import PortfolioFeatureShell from './portfolio-feature-shell';

describe('PortfolioFeatureShell', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PortfolioFeatureShell />);
    expect(baseElement).toBeTruthy();
  });
});
