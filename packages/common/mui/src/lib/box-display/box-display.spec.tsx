import { render } from '@testing-library/react';

import BoxDisplay from './box-display';

describe('BoxDisplay', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BoxDisplay />);
    expect(baseElement).toBeTruthy();
  });
});
