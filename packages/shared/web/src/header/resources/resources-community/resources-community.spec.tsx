import { render } from '@testing-library/react';

import ResourcesCommunity from './resources-community';

describe('ResourcesCommunity', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResourcesCommunity />);
    expect(baseElement).toBeTruthy();
  });
});
