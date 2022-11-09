import { render } from '@testing-library/react';

import SanitizedHtml from './sanitized-html';

describe('SanitizedHtml', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SanitizedHtml />);
    expect(baseElement).toBeTruthy();
  });
});
