import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

const alphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
type Actions<T> = (Partial<T> | [Partial<T>, ExpectFn<T> | Partial<T>])[];
interface Frame<T extends Record<string, unknown>> {
  frame: number;
  notification: {
    kind: string;
    value: T;
    error: unknown;
  };
}

const mergeFrames = <T extends Record<string, unknown>>(f: Frame<T>[]) => {
  return f.reduce((r, curFrame) => {
    if (r.length === 0) {
      return [curFrame];
    } else if (r[r.length - 1].frame === curFrame.frame) {
      // Merge values from frames together
      const lastValue = r[r.length - 1].notification.value;
      r[r.length - 1].notification.value = Object.assign(
        lastValue,
        curFrame.notification.value
      );
      return r;
    } else {
      r.push(curFrame);
      return r;
    }
  }, [] as Frame<T>[]);
};

export type ExpectFn<T> = (
  value: Partial<T>,
  index: number,
  allValues: Partial<T>[]
) => void;

export function getTestScheduler<T extends Record<string, unknown>>() {
  const testFn = (_actual: Frame<T>[], _expected: Frame<T>[]) => {
    const actual = mergeFrames(_actual);
    const expected = mergeFrames(_expected);

    expected.forEach(({ frame, notification }) => {
      const index = actual.findIndex((f) => f.frame === frame);
      expect(index).toBeGreaterThan(-1);
      expect(actual[index]).toBeDefined();

      const expectedValue = notification.value;
      if (typeof expectedValue === 'function' && actual[index]) {
        (expectedValue as ExpectFn<T>)(
          actual[index]?.notification.value,
          index,
          actual.map((f) => f.notification.value)
        );
      } else {
        expect(expectedValue).toEqual(actual[index]?.notification.value);
      }
    });
  };

  return new TestScheduler(testFn);
}

export function getSequencer<T extends Record<string, unknown>>(
  updateState: (v: Partial<T>) => void,
  manager: Observable<Partial<T>>
) {
  return (actions: Actions<T>) => {
    runSequence(updateState, manager, actions);
  };
}

export function runSequence<T extends Record<string, unknown>>(
  updateState: (v: Partial<T>) => void,
  manager: Observable<Partial<T>>,
  _actions: Actions<T>
) {
  const scheduler = getTestScheduler<T>();
  scheduler.run(({ cold, expectObservable }) => {
    // Extracts actions
    const actions = _actions.map((a) => (Array.isArray(a) ? a[0] : a));
    // Extracts expecters
    const expecters = _actions.map((a) => (Array.isArray(a) ? a[1] : null));

    // Generates a marble sequence
    const marbleSeq = new Array(actions.length)
      .fill('')
      .map((_, i) => alphanumeric[i]);

    // Executes the action sequence on test run and updates state each time
    cold(
      marbleSeq.join(''),
      Object.fromEntries(marbleSeq.map((m, i) => [m, actions[i]]))
    ).subscribe(updateState);

    // Maps the expecters to the input sequence
    const expecterMap = Object.fromEntries(
      expecters
        .map((e, i) => {
          if (e) return [marbleSeq[i], e];
          return undefined;
        })
        .filter((_) => _ !== undefined) as [string, ExpectFn<T> | Partial<T>][]
    );
    const expecterSeq = marbleSeq
      .map((m) => (expecterMap[m] ? m : '-'))
      .join('');

    expectObservable(manager).toBe(expecterSeq, expecterMap);
  });
}
