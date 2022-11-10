import { render } from '@testing-library/react';

import Dropdown from './dropdown';

describe('Selector', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Dropdown />);
    expect(baseElement).toBeTruthy();
  });
});
