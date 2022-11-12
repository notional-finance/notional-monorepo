import { render } from '@testing-library/react';

import AboutContent from './about-content';

describe('AboutContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutContent />);
    expect(baseElement).toBeTruthy();
  });
});
