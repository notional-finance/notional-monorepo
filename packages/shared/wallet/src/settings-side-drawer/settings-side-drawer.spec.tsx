import { render } from '@testing-library/react';
import SettingsSideDrawer from './settings-side-drawer';

describe('SettingsSideDrawer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SettingsSideDrawer />);
    expect(baseElement).toBeTruthy();
  });
});
