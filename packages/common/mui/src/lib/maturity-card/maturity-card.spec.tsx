import { render } from '@testing-library/react';

import MaturityCard from './maturity-card';

describe('MaturityCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MaturityCard />);
    expect(baseElement).toBeTruthy();
  });
});
