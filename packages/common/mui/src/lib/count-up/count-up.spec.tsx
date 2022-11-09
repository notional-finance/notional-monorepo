import { render } from '@testing-library/react';

import CountUp from './count-up';

describe('CountUp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CountUp />);
    expect(baseElement).toBeTruthy();
  });
});
