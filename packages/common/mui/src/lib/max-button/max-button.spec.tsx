import { render } from '@testing-library/react';

import MaxButton from './max-button';

describe('MaxButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MaxButton />);
    expect(baseElement).toBeTruthy();
  });
});
