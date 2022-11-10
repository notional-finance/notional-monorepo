import { render } from '@testing-library/react';

import AnnouncementIcon from './announcement-icon';

describe('AnnouncementIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AnnouncementIcon />);
    expect(baseElement).toBeTruthy();
  });
});
