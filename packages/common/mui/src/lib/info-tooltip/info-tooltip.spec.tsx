import { render } from '@testing-library/react';

import InfoTooltip from './info-tooltip';

describe('InfoTooltip', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InfoTooltip />);
    expect(baseElement).toBeTruthy();
  });
});
