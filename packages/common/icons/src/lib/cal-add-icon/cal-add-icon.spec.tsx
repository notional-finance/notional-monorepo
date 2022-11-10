import { render } from '@testing-library/react';

import CalAddIcon from './cal-add-icon';

describe('CalAddIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CalAddIcon />);
    expect(baseElement).toBeTruthy();
  });
});
