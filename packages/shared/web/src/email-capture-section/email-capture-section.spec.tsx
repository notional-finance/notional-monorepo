import { render } from '@testing-library/react';

import EmailCaptureSection from './email-capture-section';

describe('EmailCaptureSection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EmailCaptureSection />);
    expect(baseElement).toBeTruthy();
  });
});
