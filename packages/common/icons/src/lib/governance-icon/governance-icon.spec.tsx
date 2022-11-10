import { render } from '@testing-library/react';

import GovernanceIcon from './governance-icon';

describe('GovernanceIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GovernanceIcon />);
    expect(baseElement).toBeTruthy();
  });
});
