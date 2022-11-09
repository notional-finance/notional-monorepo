import { render } from '@testing-library/react';

import TypeForm from './type-form';

describe('TypeForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TypeForm />);
    expect(baseElement).toBeTruthy();
  });
});
