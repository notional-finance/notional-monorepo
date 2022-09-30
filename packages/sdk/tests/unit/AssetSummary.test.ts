import MockSystem from '../mocks/MockSystem';
import { System } from '../../src/system';

describe('Asset Summary', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  afterAll(() => system.destroy());

  test.todo('it produces proper roll factors');
  test.todo('it produces correct asset values');
});
