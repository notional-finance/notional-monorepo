import { render } from '@testing-library/react';

import BarChartIcon from './bar-chart-icon';

describe('BarChartIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BarChartIcon />);
    expect(baseElement).toBeTruthy();
  });
});
