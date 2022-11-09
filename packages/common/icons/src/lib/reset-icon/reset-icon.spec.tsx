import { render } from '@testing-library/react';

import ResetIcon from './reset-icon';

describe('Reset', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResetIcon />);
    expect(baseElement).toBeTruthy();
  });
});
