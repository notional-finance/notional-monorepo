import { render } from '@testing-library/react';

import FourSquareIcon from './four-square-icon';

describe('FourSquareIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FourSquareIcon />);
    expect(baseElement).toBeTruthy();
  });
});
