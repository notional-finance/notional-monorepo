import { render } from '@testing-library/react';

import ConnectCommunity from './connect-community';

describe('ConnectCommunity', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ConnectCommunity />);
    expect(baseElement).toBeTruthy();
  });
});
