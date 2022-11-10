import { render } from '@testing-library/react';

import EmptyPortfolio from './empty-portfolio';

describe('EmptyPortfolio', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EmptyPortfolio />);
    expect(baseElement).toBeTruthy();
  });
});
