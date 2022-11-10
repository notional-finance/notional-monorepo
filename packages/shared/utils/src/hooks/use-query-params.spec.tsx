import { renderHook } from '@testing-library/react-hooks';
import { MemoryRouter } from 'react-router-dom';
import { useQueryParams } from './use-query-params';

const wrapperWithOneParam = ({ children }) => (
  <MemoryRouter initialEntries={['/?test=true']}>{children}</MemoryRouter>
);
const wrapperWithEmptyParams = ({ children }) => (
  <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
);

const wrapperWithTwoParams = ({ children }) => (
  <MemoryRouter initialEntries={['/?test=true&test1=0']}>{children}</MemoryRouter>
);
describe('useQueryParams', () => {
  it('should handle one param successfully', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: wrapperWithOneParam,
    });

    expect(result.current.test).toBe('true');
  });
  it('should handle two params successfully', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: wrapperWithTwoParams,
    });

    expect(result.current.test).toBe('true');
    expect(result.current.test1).toBe('0');
  });

  it('should handle no params gracefully', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: wrapperWithEmptyParams,
    });

    expect(result.current.test).toBeUndefined();
    expect(result.current.test1).toBeUndefined();
  });
});
