import { render } from '@testing-library/react';

import HighYield from './high-yield';

describe('HighYield', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<HighYield />);
    expect(baseElement).toBeTruthy();
  });
});
