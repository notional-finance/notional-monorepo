import { render } from '@testing-library/react';

import SideBarLayout from './side-bar-layout';

describe('SideBarLayout', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SideBarLayout />);
    expect(baseElement).toBeTruthy();
  });
});
