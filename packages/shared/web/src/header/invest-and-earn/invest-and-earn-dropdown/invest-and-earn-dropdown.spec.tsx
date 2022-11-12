import { render } from '@testing-library/react';

import InvestAndEarnDropdown from './invest-and-earn-dropdown';

describe('InvestAndEarnDropdown', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InvestAndEarnDropdown />);
    expect(baseElement).toBeTruthy();
  });
});
