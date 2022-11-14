import { render } from '@testing-library/react';

import ResourceContent from './resource-content';

describe('ResourceContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResourceContent />);
    expect(baseElement).toBeTruthy();
  });
});
