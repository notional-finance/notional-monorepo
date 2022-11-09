import { render } from '@testing-library/react';

import PieChartIcon from './pie-chart-icon';

describe('PieChartIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PieChartIcon />);
    expect(baseElement).toBeTruthy();
  });
});
