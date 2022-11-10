import { render } from '@testing-library/react';

import GoogleCalIcon from './google-cal-icon';

describe('GoogleCalIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GoogleCalIcon />);
    expect(baseElement).toBeTruthy();
  });
});
