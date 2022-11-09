import { render } from '@testing-library/react';

import AboutSecurity from './about-security';

describe('AboutSecurity', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutSecurity />);
    expect(baseElement).toBeTruthy();
  });
});
