import { render } from '@testing-library/react';

import SideBarSubHeader from './side-bar-sub-header';

describe('SideBarSubHeader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SideBarSubHeader />);
    expect(baseElement).toBeTruthy();
  });
});
