import { handleError } from './error-helper';
describe('error-helper', () => {
  describe('handleError', () => {
    it('should recieve a standard Error and return an Error', () => {
      const error = new Error('test');
      const result = handleError(error);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('test');
    });
    it('should recieve a string and return an Error', () => {
      const error = 'test';
      const result = handleError(error);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('test');
    });
    it('should recieve any value other than an error or string and return an Unknown Error', () => {
      const error = { test: 'test' };
      const result = handleError(error);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Unknown error');
    });
  });
});
