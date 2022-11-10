import { render } from '@testing-library/react';

import DocsIcon from './docs-icon';

describe('DocsIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DocsIcon />);
    expect(baseElement).toBeTruthy();
  });
});
