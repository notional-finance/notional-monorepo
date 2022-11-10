import { render } from '@testing-library/react';

import CountdownCards from './countdown-cards';

describe('Selector', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CountdownCards />);
    expect(baseElement).toBeTruthy();
  });
});
