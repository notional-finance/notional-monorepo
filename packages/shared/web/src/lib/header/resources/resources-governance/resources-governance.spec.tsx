import { render } from '@testing-library/react';

import ResourcesGovernance from './resources-governance';

describe('ResourcesGovernance', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResourcesGovernance />);
    expect(baseElement).toBeTruthy();
  });
});
