import { Collection, List, Map, OrderedSet, Range, Seq } from 'immutable';

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

describe.each([[List], [Seq.Indexed]])('operations on %p', (ctorFn: <T>(values: Iterable<T>) => List<T> | Seq.Indexed<T>) => {
  test('toArray provides a JS array', () => {
    const v = ctorFn(['a', 'b', 'c']);
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  test('does not accept a scalar', () => {
    expect(() => {
      ctorFn(3 as any);
    }).toThrow('Expected Array or collection object of values: 3');
  });

  test('supports toArray', () => {
    const v = ctorFn(['a', 'b', 'c']);
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  test('supports get(number)', () => {
    const v = ctorFn(['a', 'b', 'c']);
    expect(v.get(1)).toBe('b');
  });

  test('can getIn a deep value', () => {
    const v = ctorFn([
      Map({
        aKey: ctorFn(['bad', 'good']),
      }),
    ]);
    expect(v.getIn([0, 'aKey', 1])).toBe('good');
  });

  test('returns undefined when getting a null value', () => {
    const v = ctorFn([1, 2, 3]);
    expect(v.get(null as any)).toBe(undefined);

    const o = ctorFn([{ a: 1 }, { b: 2 }, { c: 3 }]);
    expect(o.get(null as any)).toBe(undefined);
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

  test('uses not set value for string index', () => {
    const list: any = ctorFn([]);
    expect(list.get('stringKey', 'NOT-SET')).toBe('NOT-SET');
  });

  test('uses not set value for index {}', () => {
    const list: any = ctorFn([1, 2, 3, 4, 5]);
    expect(list.get({}, 'NOT-SET')).toBe('NOT-SET');
  });

  test('uses not set value for index void 0', () => {
    const list: any = ctorFn([1, 2, 3, 4, 5]);
    expect(list.get(void 0, 'NOT-SET')).toBe('NOT-SET');
  });

  test('uses not set value for index undefined', () => {
    const list: any = ctorFn([1, 2, 3, 4, 5]);
    expect(list.get(undefined, 'NOT-SET')).toBe('NOT-SET');
  });

  test('doesnt coerce empty strings to index 0', () => {
    const list: any = ctorFn([1, 2, 3]);
    expect(list.has('')).toBe(false);
  });

  test('doesnt contain elements at non-empty string keys', () => {
    const list: any = ctorFn([1, 2, 3, 4, 5]);
    expect(list.has('str')).toBe(false);
  });

  test('hasIn doesnt contain elements at non-empty string keys', () => {
    const list: any = ctorFn([1, 2, 3, 4, 5]);
    expect(list.hasIn(['str'])).toBe(false);
  });

  test('hasIn doesnt throw for bad key-path', () => {
    const list = ctorFn([1, 2, 3, 4, 5]);
    expect(list.hasIn([1, 2, 3])).toBe(false);

    const list2 = ctorFn([{}]);
    expect(list2.hasIn([0, 'bad'])).toBe(false);
  });

  test('get helpers make for easier to read code', () => {
    const v = ctorFn(['a', 'b', 'c']);
    expect(v.first()).toBe('a');
    expect(v.last()).toBe('c');
  });

  test('slice helpers make for easier to read code', () => {
    const v0 = ctorFn(['a', 'b', 'c']);
    const v1 = ctorFn(['a', 'b']);
    const v2 = ctorFn(['a']);
    const v3 = ctorFn([]);

    expect(v0.rest().toArray()).toEqual(['b', 'c']);
    expect(v0.butLast().toArray()).toEqual(['a', 'b']);

    expect(v1.rest().toArray()).toEqual(['b']);
    expect(v1.butLast().toArray()).toEqual(['a']);

    expect(v2.rest().toArray()).toEqual([]);
    expect(v2.butLast().toArray()).toEqual([]);

    expect(v3.rest().toArray()).toEqual([]);
    expect(v3.butLast().toArray()).toEqual([]);
  });

  test('can contain a large number of indices', () => {
    const r = ctorFn(Range(0, 20000));
    let iterations = 0;
    r.forEach(v => {
      expect(v).toBe(iterations);
      iterations++;
    });
  });

  test('has the same iterator function for values', () => {
    const l = ctorFn(['a', 'b', 'c']);
    expect(l[Symbol.iterator]).toBe(l.values);
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

  test('finds values using findEntry', () => {
    const v = ctorFn(['a', 'b', 'c', 'B', 'a']);
    expect(v.findEntry(value => value.toUpperCase() === value)).toEqual([
      3,
      'B',
    ]);
    expect(v.findEntry(value => value.length > 1)).toBe(undefined);
  });

  test('maps values', () => {
    const v = ctorFn(['a', 'b', 'c']);
    const r = v.map(value => value.toUpperCase());
    expect(r.toArray()).toEqual(['A', 'B', 'C']);
  });

  test('ensures iter is unmodified', () => {
    const v = ctorFn([1, 2, 3]);
    const r = v.map((value, index, iter) => {
      return iter.get(index - 1);
    });
    expect(r.toArray()).toEqual([3, 1, 2]);
  });

  test('filters values', () => {
    const v: Collection.Indexed<string> = ctorFn(['a', 'b', 'c', 'd', 'e', 'f']);
    const r = v.filter((value, index) => index % 2 === 1);
    expect(r.toArray()).toEqual(['b', 'd', 'f']);
  });

  test('partitions values', () => {
    const v: Collection.Indexed<string> = ctorFn(['a', 'b', 'c', 'd', 'e', 'f']);
    let callCount = 0;
    const [r0, r1] = v.partition((value, index) => {
      ++callCount;
      return index % 2 === 1;
    });
    expect(r0.toArray()).toEqual(['a', 'c', 'e']);
    expect(r1.toArray()).toEqual(['b', 'd', 'f']);
  });

  test('filters values based on type', () => {
    class A {}
    class B extends A {
      b(): void {
        return;
      }
    }
    class C extends A {
      c(): void {
        return;
      }
    }
    const l1: Collection.Indexed<A> = ctorFn<A>([new B(), new C(), new B(), new C()]);
    // tslint:disable-next-line:arrow-parens
    const l2: Collection.Indexed<C> = l1.filter((v): v is C => v instanceof C);
    expect(l2.count()).toEqual(2);
    expect(l2.every(v => v instanceof C)).toBe(true);
  });

  test('partitions values based on type', () => {
    class A {}
    class B extends A {
      b(): void {
        return;
      }
    }
    class C extends A {
      c(): void {
        return;
      }
    }
    const l1: Collection.Indexed<A> = ctorFn<A>([new B(), new C(), new B(), new C()]);
    // tslint:disable-next-line:arrow-parens
    const [l2, lc]: [Collection.Indexed<A>, Collection.Indexed<C>] = l1.partition((v): v is C => v instanceof C);
    expect(l2.count()).toEqual(2);
    expect(lc.count()).toEqual(2);
    expect(l2.some(v => v instanceof C)).toBe(false);
    expect(lc.every(v => v instanceof C)).toBe(true);
  });

  test('reduces values', () => {
    const v: Collection.Indexed<number> = ctorFn([1, 10, 100]);
    const r = v.reduce<number>((reduction, value) => reduction + value);
    expect(r).toEqual(111);
    const r2 = v.reduce((reduction, value) => reduction + value, 1000);
    expect(r2).toEqual(1111);
  });

  test('reduces from the right', () => {
    const v: Collection.Indexed<string> = ctorFn(['a', 'b', 'c']);
    const r = v.reduceRight((reduction, value) => reduction + value);
    expect(r).toEqual('cba');
    const r2 = v.reduceRight((reduction, value) => reduction + value, 'x');
    expect(r2).toEqual('xcba');
  });

  test('takes maximum number', () => {
    const v = ctorFn(['a', 'b', 'c']);
    const r = v.take(Number.MAX_SAFE_INTEGER);
    expect(r).toBe(v);
  });

  test('takes and skips values', () => {
    const v = ctorFn(['a', 'b', 'c', 'd', 'e', 'f']);
    const r = v.skip(2).take(2);
    expect(r.toArray()).toEqual(['c', 'd']);
  });

  test('takes and skips no-ops return same reference', () => {
    const v = ctorFn(['a', 'b', 'c', 'd', 'e', 'f']);
    const r = v.skip(0).take(6);
    expect(r).toBe(v);
  });

  test('takeLast and skipLast values', () => {
    const v = ctorFn(['a', 'b', 'c', 'd', 'e', 'f']);
    const r = v.skipLast(1).takeLast(2);
    expect(r.toArray()).toEqual(['d', 'e']);
  });

  test('takeLast and skipLast no-ops return same reference', () => {
    const v = ctorFn(['a', 'b', 'c', 'd', 'e', 'f']);
    const r = v.skipLast(0).takeLast(6);
    expect(r).toBe(v);
  });

  test('efficiently chains array methods', () => {
    const v: Collection.Indexed<number> = ctorFn([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

    const r = v
      .filter(x => x % 2 === 0)
      .skip(2)
      .map(x => x * x)
      .take(3)
      .reduce((a: number, b: number) => a + b, 0);

    expect(r).toEqual(200);
  });

  test('can convert to a map', () => {
    const v = ctorFn(['a', 'b', 'c']);
    const m = v.toMap();
    expect(m.size).toBe(3);
    expect(m.get(1)).toBe('b');
  });

  test('reverses', () => {
    const v = ctorFn(['a', 'b', 'c']);
    expect(v.reverse().toArray()).toEqual(['c', 'b', 'a']);
  });

  test('ensures equality', () => {
    // Make a sufficiently long list.
    const a = Array(100).join('abcdefghijklmnopqrstuvwxyz').split('');
    const v1 = ctorFn(a);
    const v2 = ctorFn(a);
    // tslint:disable-next-line: triple-equals
    expect(v1 == v2).not.toBe(true);
    expect(v1 === v2).not.toBe(true);
    expect(v1.equals(v2)).toBe(true);
  });


  // TODO: assert that findIndex only calls the function as much as it needs to.

  test('forEach iterates in the correct order', () => {
    let n = 0;
    const a: Array<any> = [];
    const v = ctorFn([0, 1, 2, 3, 4]);
    v.forEach(x => {
      a.push(x);
      n++;
    });
    expect(n).toBe(5);
    expect(a.length).toBe(5);
    expect(a).toEqual([0, 1, 2, 3, 4]);
  });

  test('forEach iteration terminates when callback returns false', () => {
    const a: Array<any> = [];
    function count(x) {
      if (x > 2) {
        return false;
      }
      a.push(x);
    }
    const v = ctorFn([0, 1, 2, 3, 4]);
    v.forEach(count);
    expect(a).toEqual([0, 1, 2]);
  });

  test('concat works like Array.prototype.concat', () => {
    const v1 = ctorFn([1, 2, 3]);
    const v2 = v1.concat(
      4,
      List([5, 6]),
      [7, 8],
      Seq([9, 10]),
      OrderedSet.of(11, 12),
      null as any
    );
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, null]);
  });

  test('concat works like Array.prototype.concat even for IE11', () => {
    const v1 = ctorFn([1, 2, 3]);
    const a = [4];

    // remove Symbol.iterator as IE11 does not handle it.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/@@iterator#browser_compatibility
    // @ts-expect-error -- simulate IE11
    a[Symbol.iterator] = undefined;

    const v2 = v1.concat(a);
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([1, 2, 3, 4]);
  });

  test('concat returns self when no changes', () => {
    const v1 = ctorFn([1, 2, 3]);
    expect(v1.concat([])).toBe(v1);
  });

  test('concat returns arg when concat to empty', () => {
    const v1 = ctorFn([1, 2, 3]);
    expect(ctorFn([]).concat(v1)).toBe(v1);
  });

  test('concats a single value', () => {
    const v1 = ctorFn([1, 2, 3]);
    expect(v1.concat(4).toArray()).toEqual([1, 2, 3, 4]);
  });

  test('concat returns ctorFn-coerced arg when concat to empty', () => {
    expect(ctorFn([]).concat([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
  });

  test('concat does not spread in string characters', () => {
    const v1 = ctorFn([1, 2, 3]);
    expect(v1.concat('abcdef').toArray()).toEqual([1, 2, 3, 'abcdef']);
  });

  test('can be efficiently sliced', () => {
    const v1 = ctorFn(Range(0, 2000));
    const v2 = ctorFn(v1.slice(100, -100));
    const v3 = v2.slice(0, Infinity);
    expect(v1.count()).toBe(2000);
    expect(v2.count()).toBe(1800);
    expect(v3.count()).toBe(1800);
    expect(v2.first()).toBe(100);
    expect(v2.rest().count()).toBe(1799);
    expect(v2.last()).toBe(1899);
    expect(v2.butLast().count()).toBe(1799);
  });

  test('Does not infinite loop when sliced with NaN #459', () => {
    const list = ctorFn([1, 2, 3, 4, 5]);
    const newList = list.slice(0, NaN);
    expect(newList.toJS()).toEqual([]);
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

  describe('when slicing', () => {
    [NaN, -Infinity].forEach(zeroishValue => {
      test(`considers a ${zeroishValue} begin argument to be zero`, () => {
        const v1 = ctorFn(['a', 'b', 'c']);
        const v2 = v1.slice(zeroishValue, 3);
        expect(v2.count()).toBe(3);
      });
      test(`considers a ${zeroishValue} end argument to be zero`, () => {
        const v1 = ctorFn(['a', 'b', 'c']);
        const v2 = v1.slice(0, zeroishValue);
        expect(v2.count()).toBe(0);
      });
      test(`considers ${zeroishValue} begin and end arguments to be zero`, () => {
        const v1 = ctorFn(['a', 'b', 'c']);
        const v2 = v1.slice(zeroishValue, zeroishValue);
        expect(v2.count()).toBe(0);
      });
    });
  });

  describe('Iterator', () => {
    const pInt = gen.posInt;

    check.it('iterates through ctorFn', [pInt, pInt], (start, len) => {
      const l1 = Range(0, start + len).toList();
      const l2 = l1.slice(start, start + len);
      expect(l2.count()).toBe(len);
      const valueIter = l2.values();
      const keyIter = l2.keys();
      const entryIter = l2.entries();
      for (let ii = 0; ii < len; ii++) {
        expect(valueIter.next().value).toBe(start + ii);
        expect(keyIter.next().value).toBe(ii);
        expect(entryIter.next().value).toEqual([ii, start + ii]);
      }
    });

    check.it('iterates through ctorFn in reverse', [pInt, pInt], (start, len) => {
      const l1 = Range(0, start + len).toList();
      const l2 = l1.slice(start, start + len);
      const s = l2.toSeq().reverse(); // impl calls ctorFn.__iterator(REVERSE)
      expect(s.size).toBe(len);
      const valueIter = s.values();
      const keyIter = s.keys();
      const entryIter = s.entries();
      for (let ii = 0; ii < len; ii++) {
        expect(valueIter.next().value).toBe(start + len - 1 - ii);
        expect(keyIter.next().value).toBe(ii);
        expect(entryIter.next().value).toEqual([ii, start + len - 1 - ii]);
      }
    });
  });
});
