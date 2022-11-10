import { render } from '@testing-library/react';

import ActionSidebarButtons from './action-sidebar-buttons';

describe('ActionSidebarButtons', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActionSidebarButtons />);
    expect(baseElement).toBeTruthy();
  });
});
