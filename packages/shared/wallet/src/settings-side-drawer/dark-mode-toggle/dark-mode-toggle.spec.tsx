import { render } from '@testing-library/react';
import DarkModeToggle from './dark-mode-toggle';

describe('DarkModeToggle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DarkModeToggle />);
    expect(baseElement).toBeTruthy();
  });
});
