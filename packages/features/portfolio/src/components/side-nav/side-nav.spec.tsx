import { render } from '@testing-library/react';

import SideNav from './side-nav';

describe('SideNav', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SideNav />);
    expect(baseElement).toBeTruthy();
  });
});
