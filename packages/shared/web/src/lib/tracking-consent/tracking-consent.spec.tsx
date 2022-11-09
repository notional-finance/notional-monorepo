import { render } from '@testing-library/react';

import TrackingConsent from './tracking-consent';

describe('TrackingConsent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TrackingConsent />);
    expect(baseElement).toBeTruthy();
  });
});
