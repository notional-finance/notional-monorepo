import { render } from '@testing-library/react';

import SectionLink from './section-link';

describe('SectionLink', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SectionLink />);
    expect(baseElement).toBeTruthy();
  });
});
