import { render } from '@testing-library/react';
import NotificationsSideDrawer from './notifications-side-drawer';

describe('NotificationsSideDrawer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NotificationsSideDrawer />);
    expect(baseElement).toBeTruthy();
  });
});
