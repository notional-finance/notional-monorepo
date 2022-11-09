import { render } from '@testing-library/react';

import ResourcesDropdown from './resources-dropdown';

describe('ResourcesDropdown', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResourcesDropdown />);
    expect(baseElement).toBeTruthy();
  });
});
