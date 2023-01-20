import { render } from '@testing-library/react';

import SideDrawerButton from './side-drawer-button';

describe('SideDrawerButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SideDrawerButton />);
    expect(baseElement).toBeTruthy();
  });
});
