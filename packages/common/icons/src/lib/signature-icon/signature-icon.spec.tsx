import { render } from '@testing-library/react';

import SignatureIcon from './signature-icon';

describe('SignatureIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SignatureIcon />);
    expect(baseElement).toBeTruthy();
  });
});
