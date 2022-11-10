import { render } from '@testing-library/react';

import MicrosoftCalIcon from './microsoft-cal-icon';

describe('MicrosoftCalIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MicrosoftCalIcon />);
    expect(baseElement).toBeTruthy();
  });
});
