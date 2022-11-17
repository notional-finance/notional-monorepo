import { render } from '@testing-library/react';
import Privacy from './privacy';

describe('Privacy', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Privacy />);
    expect(baseElement).toBeTruthy();
  });
});
