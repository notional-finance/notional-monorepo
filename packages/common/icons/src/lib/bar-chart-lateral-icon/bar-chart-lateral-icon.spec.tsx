import { render } from '@testing-library/react';

import BarChartLateralIcon from './bar-chart-lateral-icon';

describe('BarChartLateralIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BarChartLateralIcon />);
    expect(baseElement).toBeTruthy();
  });
});
