import { render } from '@testing-library/react';

import AboutDropdown from './about-dropdown';

describe('AboutDropdown', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutDropdown />);
    expect(baseElement).toBeTruthy();
  });
});
