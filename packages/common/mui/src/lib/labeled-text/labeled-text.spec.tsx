import { render } from '@testing-library/react';

import LabeledText from './labeled-text';

describe('LabeledText', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LabeledText />);
    expect(baseElement).toBeTruthy();
  });
});
