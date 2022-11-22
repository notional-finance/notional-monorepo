import { render } from '@testing-library/react';
import Language from './language';

describe('Language', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Language />);
    expect(baseElement).toBeTruthy();
  });
});
