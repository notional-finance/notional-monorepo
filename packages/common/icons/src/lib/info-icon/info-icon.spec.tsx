import { render } from '@testing-library/react';

import InfoIcon from './info-icon';

describe('InfoIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InfoIcon />);
    expect(baseElement).toBeTruthy();
  });
});
