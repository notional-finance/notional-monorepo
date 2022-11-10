import { render } from '@testing-library/react';

import DropdownButton from './dropdown-button';

describe('DropdownButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DropdownButton />);
    expect(baseElement).toBeTruthy();
  });
});
