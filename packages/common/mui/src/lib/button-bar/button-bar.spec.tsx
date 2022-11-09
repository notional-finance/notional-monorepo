import { render } from '@testing-library/react';

import ButtonBar from './button-bar';

describe('ButtonBar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonBar />);
    expect(baseElement).toBeTruthy();
  });
});
