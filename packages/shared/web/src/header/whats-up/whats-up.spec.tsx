import { render } from '@testing-library/react';

import WhatsUp from './whats-up';

describe('WhatsUp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WhatsUp />);
    expect(baseElement).toBeTruthy();
  });
});
