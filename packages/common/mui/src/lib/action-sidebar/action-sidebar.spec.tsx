import { render } from '@testing-library/react';

import ActionSidebar from './action-sidebar';

describe('ActionSidebar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActionSidebar />);
    expect(baseElement).toBeTruthy();
  });
});
