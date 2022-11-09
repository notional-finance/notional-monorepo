import { render } from '@testing-library/react';

import ToggleSwitch from './toggle-switch';

describe('Switch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ToggleSwitch />);
    expect(baseElement).toBeTruthy();
  });
});
