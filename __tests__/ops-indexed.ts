import { Collection, List, Seq } from 'immutable';

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

describe.each([[List], [Seq.Indexed]])('Collection.Indexed methods on %p', (ctorFn: <T>(values: Iterable<T>) => Collection.Indexed<T>) => {

  test('does not accept a scalar', () => {
    expect(() => {
      // @ts-expect-error
      ctorFn(3);
    }).toThrow('Expected Array or collection object of values: 3');
  });

  test('supports get(number)', () => {
    const v = ctorFn(['a', 'b', 'c']);
    expect(v.get(1)).toBe('b');
  });

  test('finds values using indexOf', () => {
    const v = ctorFn(['a', 'b', 'c', 'b', 'a']);
    expect(v.indexOf('b')).toBe(1);
    expect(v.indexOf('c')).toBe(2);
    expect(v.indexOf('d')).toBe(-1);
  });

  test('finds values using lastIndexOf', () => {
    const v = ctorFn(['a', 'b', 'c', 'b', 'a']);
    expect(v.lastIndexOf('b')).toBe(3);
    expect(v.lastIndexOf('c')).toBe(2);
    expect(v.lastIndexOf('d')).toBe(-1);
  });

  test('finds values using findIndex', () => {
    const v = ctorFn(['a', 'b', 'c', 'B', 'a']);
    expect(v.findIndex(value => value.toUpperCase() === value)).toBe(3);
    expect(v.findIndex(value => value.length > 1)).toBe(-1);
  });


  test('can convert to a map', () => {
    const v = ctorFn(['a', 'b', 'c']);
    const m = v.toMap();
    expect(m.size).toBe(3);
    expect(m.get(1)).toBe('b');
  });
});
