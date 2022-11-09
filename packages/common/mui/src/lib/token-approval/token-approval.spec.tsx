import { render } from '@testing-library/react';

import TokenApproval from './token-approval';

describe('TokenApproval', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TokenApproval />);
    expect(baseElement).toBeTruthy();
  });
});
