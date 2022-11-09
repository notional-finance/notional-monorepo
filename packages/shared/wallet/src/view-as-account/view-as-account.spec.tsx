import { render } from '@testing-library/react';

import ViewAsAccount from './view-as-account';

describe('ViewAsAccount', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ViewAsAccount />);
    expect(baseElement).toBeTruthy();
  });
});
