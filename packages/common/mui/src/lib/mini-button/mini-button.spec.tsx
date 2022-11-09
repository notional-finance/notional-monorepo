import { render } from '@testing-library/react';

import MiniButton from './mini-button';

describe('MiniButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MiniButton />);
    expect(baseElement).toBeTruthy();
  });
});
