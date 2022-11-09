import { render } from '@testing-library/react';

import AboutCompany from './about-company';

describe('AboutCompany', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutCompany />);
    expect(baseElement).toBeTruthy();
  });
});
