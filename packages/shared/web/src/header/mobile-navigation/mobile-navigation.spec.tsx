import { render } from '@testing-library/react';

import MobileNavigation from './mobile-navigation';

describe('MobileNavigation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MobileNavigation />);
    expect(baseElement).toBeTruthy();
  });
});
