import { render } from '@testing-library/react';

import ResourcesLearn from './resources-learn';

describe('ResourcesLearn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResourcesLearn />);
    expect(baseElement).toBeTruthy();
  });
});
