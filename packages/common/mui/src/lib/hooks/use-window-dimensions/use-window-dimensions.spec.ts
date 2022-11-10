import { act, renderHook } from '@testing-library/reacts';
import useWindowDimensions from './use-window-dimensions';

describe('useWindowDimensions', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useWindowDimensions());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
