import { render } from '@testing-library/react';

import RiskSlider from './risk-slider';

describe('RiskSlider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RiskSlider />);
    expect(baseElement).toBeTruthy();
  });
});
