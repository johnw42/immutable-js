import { Collection, List, Map, Seq } from 'immutable';

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

const INDEXED_TYPES = [['List', List], ['Seq.Indexed', Seq.Indexed]] as const;
type IndexedCtorFn = <T>(values: Iterable<T>) => Collection.Indexed<T>;

// Tests for methods of Collection.Indexed.  See below for additional tests that
// also apply to Seq.
describe.each(INDEXED_TYPES)('Collection.Indexed methods on %s', (name, ctorFn: IndexedCtorFn) => {
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

const SEQ_LIKE_TYPES = [['List', List], ['Seq', Seq], ['Seq.Indexed', Seq.Indexed]] as const;
type SeqLikeCtorFn = <T>(values: Iterable<T>) => Collection<any, T>;


// Tests for methods of Collection.Indexed that also work on Seq.  Seq is an
// unusual type because it is not a true indexed type, but it supports some of
// the methods that are otherwise unique to indexed types.
describe.each(SEQ_LIKE_TYPES)('Seq-line methods on %s', (name, ctorFn: SeqLikeCtorFn) => {
  test('can getIn a deep value', () => {
    const v = ctorFn([
      Map({
        aKey: ctorFn(['bad', 'good']),
      }),
    ]);
    expect(v.getIn([0, 'aKey', 1])).toBe('good');
  });

  test('ensures iter is unmodified', () => {
    const v = ctorFn([1, 2, 3]);
    const r = v.map((value, index, iter) => {
      return iter.get(index - 1);
    });
    expect(r.toArray()).toEqual([3, 1, 2]);
  });

  test('counts from the end of the list on negative index', () => {
    const i = ctorFn([1, 2, 3, 4, 5, 6, 7]);
    expect(i.get(-1)).toBe(7);
    expect(i.get(-5)).toBe(3);
    expect(i.get(-9)).toBe(undefined);
    expect(i.get(-999, 1000)).toBe(1000);
  });

  test('coerces numeric-string keys', () => {
    // Of course, TypeScript protects us from this, so cast to "any" to test.
    const i: any = ctorFn([1, 2, 3, 4, 5, 6]);
    expect(i.get('1')).toBe(2);
    // Like array, string negative numbers do not qualify
    expect(i.get('-1')).toBe(undefined);
    // Like array, string floating point numbers do not qualify
    expect(i.get('1.0')).toBe(undefined);
  });

  test('finds values using findEntry', () => {
    const v = ctorFn(['a', 'b', 'c', 'B', 'a']);
    expect(v.findEntry(value => value.toUpperCase() === value)).toEqual([
      3,
      'B',
    ]);
    expect(v.findEntry(value => value.length > 1)).toBe(undefined);
  });

  test('Accepts NaN for slice and concat #602', () => {
    const list = ctorFn([]).slice(0, NaN).concat(NaN);
    // toEqual([ NaN ])
    expect(list.count()).toBe(1);
    expect(isNaNValue(list.get(0))).toBe(true);
  });

  // Note: NaN is the only value not equal to itself. The isNaN() built-in
  // function returns true for any non-numeric value, not just the NaN value.
  function isNaNValue(value) {
    return value !== value;
  }
});
