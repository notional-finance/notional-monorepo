import { render } from '@testing-library/react';

import PreviousUiPopup from './previous-ui-popup';

describe('PreviousUiPopup', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PreviousUiPopup />);
    expect(baseElement).toBeTruthy();
  });
});
