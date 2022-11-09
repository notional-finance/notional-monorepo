import { render } from '@testing-library/react';

import ProgressIndicator from './progress-indicator';

describe('ProgressIndicator', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProgressIndicator />);
    expect(baseElement).toBeTruthy();
  });
});
