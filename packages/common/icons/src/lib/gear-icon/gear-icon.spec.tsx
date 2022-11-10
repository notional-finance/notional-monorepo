import { render } from '@testing-library/react';

import GearIcon from './gear-icon';

describe('GearIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GearIcon />);
    expect(baseElement).toBeTruthy();
  });
});
