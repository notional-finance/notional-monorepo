import { render } from '@testing-library/react';

import SideDrawer from './side-drawer';

describe('SideDrawer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SideDrawer />);
    expect(baseElement).toBeTruthy();
  });
});
