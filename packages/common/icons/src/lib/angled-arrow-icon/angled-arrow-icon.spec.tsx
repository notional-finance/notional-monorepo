import { render } from '@testing-library/react';

import AngledArrowIcon from './angled-arrow-icon';

describe('AngledArrow', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AngledArrowIcon />);
    expect(baseElement).toBeTruthy();
  });
});
