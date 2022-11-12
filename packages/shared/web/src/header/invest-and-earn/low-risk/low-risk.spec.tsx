import { render } from '@testing-library/react';

import LowRisk from './low-risk';

describe('LowRisk', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LowRisk />);
    expect(baseElement).toBeTruthy();
  });
});
