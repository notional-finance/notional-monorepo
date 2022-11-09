import { render } from '@testing-library/react';

import PageLoading from './page-loading';

describe('PageLoading', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageLoading />);
    expect(baseElement).toBeTruthy();
  });
});
