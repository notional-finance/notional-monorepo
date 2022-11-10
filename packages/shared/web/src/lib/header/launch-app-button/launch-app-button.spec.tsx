import { render } from '@testing-library/react';

import LaunchAppButton from './launch-app-button';

describe('LaunchAppButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LaunchAppButton />);
    expect(baseElement).toBeTruthy();
  });
});
