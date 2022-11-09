import { render } from '@testing-library/react';

import PortfolioChartIcon from './portfolio-chart-icon';

describe('PortfolioChartIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PortfolioChartIcon />);
    expect(baseElement).toBeTruthy();
  });
});
