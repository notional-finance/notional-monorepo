import { render } from '@testing-library/react';

import OutlookCalIcon from './outlook-cal-icon';

describe('OutlookCalIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OutlookCalIcon />);
    expect(baseElement).toBeTruthy();
  });
});
