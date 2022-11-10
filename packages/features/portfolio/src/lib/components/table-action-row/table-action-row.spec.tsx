import { render } from '@testing-library/react';

import TableActionRow from './table-action-row';

describe('SupportedCurrencies', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableActionRow />);
    expect(baseElement).toBeTruthy();
  });
});
