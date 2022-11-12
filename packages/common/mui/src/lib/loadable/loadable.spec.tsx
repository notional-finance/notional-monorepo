import { render } from '@testing-library/react';

import Loadable from './loadable';

describe('Loadable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Loadable />);
    expect(baseElement).toBeTruthy();
  });
});
