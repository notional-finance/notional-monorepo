import { render } from '@testing-library/react';

import IcalIcon from './ical-icon';

describe('IcalIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IcalIcon />);
    expect(baseElement).toBeTruthy();
  });
});
