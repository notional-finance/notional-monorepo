import { render } from '@testing-library/react';

import SectionTitle from './section-title';

describe('SectionTitle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SectionTitle />);
    expect(baseElement).toBeTruthy();
  });
});
