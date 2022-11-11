import { getStyles } from './style-helpers';

describe('styleHelpers', () => {
  it('should return a style given a style prop', () => {
    expect(getStyles('white')).toEqual('#FFFFFF');
  });

  it('should return an object of key:value pairs given a list of props', () => {
    const styles = getStyles(['white', 'aqua', 'radius']);
    expect(styles.white).toBe('#FFFFFF');
  });

  it('should fail if passing a name that does not exist', () => {
    const styles = getStyles(['corn', 'aqua', 'radius']);
    expect(styles).toMatchObject({ corn: '', radius: '5px', aqua: '#13BBC2' });
  });
});
