import { fromJS, List, Map, Range, Seq, Set } from 'immutable';

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

function arrayOfSize(s: number) {
  const a = new Array(s);
  for (let ii = 0; ii < s; ii++) {
    a[ii] = ii;
  }
  return a;
}

describe('List', () => {
  it('determines assignment of unspecified value types', () => {
    interface Test {
      list: List<string>;
    }

    const t: Test = {
      list: List(),
    };

    expect(t.list.size).toBe(0);
  });

  it('of provides initial values', () => {
    const v = List.of('a', 'b', 'c');
    expect(v.get(0)).toBe('a');
    expect(v.get(1)).toBe('b');
    expect(v.get(2)).toBe('c');
  });

  it('accepts an array', () => {
    const v = List(['a', 'b', 'c']);
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts an array-like', () => {
    const v = List({ length: 3, 2: 'c' });
    expect(v.get(2)).toBe('c');
    expect(v.toArray()).toEqual([undefined, undefined, 'c']);
  });

  it('accepts any array-like collection, including strings', () => {
    const v = List('abc');
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts an indexed Seq', () => {
    const seq = Seq(['a', 'b', 'c']);
    const v = List(seq);
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a keyed Seq as a list of entries', () => {
    const seq = Seq({ a: null, b: null, c: null }).flip();
    const v = List(seq);
    expect(v.toArray()).toEqual([
      [null, 'a'],
      [null, 'b'],
      [null, 'c'],
    ]);
    // Explicitly getting the values sequence
    const v2 = List(seq.valueSeq());
    expect(v2.toArray()).toEqual(['a', 'b', 'c']);
    // toList() does this for you.
    const v3 = seq.toList();
    expect(v3.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('can set and get a value', () => {
    let v = List();
    expect(v.get(0)).toBe(undefined);
    v = v.set(0, 'value');
    expect(v.get(0)).toBe('value');
  });

  it('can setIn and getIn a deep value', () => {
    let v = List([
      Map({
        aKey: List(['bad', 'good']),
      }),
    ]);
    expect(v.getIn([0, 'aKey', 1])).toBe('good');
    v = v.setIn([0, 'aKey', 1], 'great');
    expect(v.getIn([0, 'aKey', 1])).toBe('great');
  });

  it('can setIn on an inexistant index', () => {
    const myMap = Map<string, any>({ a: [], b: [] });
    const out = myMap.setIn(['a', 0], 'v').setIn(['c', 0], 'v');

    expect(out.getIn(['a', 0])).toEqual('v');
    expect(out.getIn(['c', 0])).toEqual('v');
    expect(out.get('a')).toBeInstanceOf(Array);
    expect(out.get('b')).toBeInstanceOf(Array);
    expect(out.get('c')).toBeInstanceOf(Map);
    expect(out.get('c').keySeq().first()).toBe(0);
  });

  it('throw when calling setIn on a non data structure', () => {
    const avengers = [
      'ironMan', // index [0]
      [
        'captainAmerica', // index [1][0]
        [
          'blackWidow', // index [1][1][0]
          ['theHulk'], // index [1][1][1][0]
        ],
      ],
    ];

    const avengersList = fromJS(avengers) as List<unknown>;

    // change theHulk to scarletWitch
    const out1 = avengersList.setIn([1, 1, 1, 0], 'scarletWitch');
    expect(out1.getIn([1, 1, 1, 0])).toEqual('scarletWitch');

    const out2 = avengersList.setIn([1, 1, 1, 3], 'scarletWitch');
    expect(out2.getIn([1, 1, 1, 3])).toEqual('scarletWitch');

    expect(() => {
      avengersList.setIn([0, 1], 'scarletWitch');
    }).toThrow(
      'Cannot update within non-data-structure value in path [0]: ironMan'
    );
  });

  it('can update a value', () => {
    const l = List.of(5);
    // @ts-ignore (Type definition limitation)
    expect(l.update(0, v => v * v).toArray()).toEqual([25]);
  });

  it('can updateIn a deep value', () => {
    let l = List([
      Map({
        aKey: List(['bad', 'good']),
      }),
    ]);
    // @ts-ignore (Type definition limitation)
    l = l.updateIn([0, 'aKey', 1], v => v + v);
    expect(l.toJS()).toEqual([
      {
        aKey: ['bad', 'goodgood'],
      },
    ]);
  });

  it('coerces numeric-string keys', () => {
    // Of course, TypeScript protects us from this, so cast to "any" to test.
    const i: any = List.of(1, 2, 3, 4, 5, 6);
    expect(i.get('1')).toBe(2);
    expect(i.set('3', 10).get('3')).toBe(10);
    // Like array, string negative numbers do not qualify
    expect(i.get('-1')).toBe(undefined);
    // Like array, string floating point numbers do not qualify
    expect(i.get('1.0')).toBe(undefined);
  });

  it('setting creates a new instance', () => {
    const v0 = List.of('a');
    const v1 = v0.set(0, 'A');
    expect(v0.get(0)).toBe('a');
    expect(v1.get(0)).toBe('A');
  });

  it('size includes the highest index', () => {
    const v0 = List();
    const v1 = v0.set(0, 'a');
    const v2 = v1.set(1, 'b');
    const v3 = v2.set(2, 'c');
    expect(v0.size).toBe(0);
    expect(v1.size).toBe(1);
    expect(v2.size).toBe(2);
    expect(v3.size).toBe(3);
  });

  it('can set at arbitrary indices', () => {
    const v0 = List.of('a', 'b', 'c');
    const v1 = v0.set(1, 'B'); // within existing tail
    const v2 = v1.set(3, 'd'); // at last position
    const v3 = v2.set(31, 'e'); // (testing internal guts)
    const v4 = v3.set(32, 'f'); // (testing internal guts)
    const v5 = v4.set(1023, 'g'); // (testing internal guts)
    const v6 = v5.set(1024, 'h'); // (testing internal guts)
    const v7 = v6.set(32, 'F'); // set within existing tree
    expect(v7.size).toBe(1025);
    const expectedArray = ['a', 'B', 'c', 'd'];
    expectedArray[31] = 'e';
    expectedArray[32] = 'F';
    expectedArray[1023] = 'g';
    expectedArray[1024] = 'h';
    expect(v7.toArray()).toEqual(expectedArray);
  });

  it('describes a dense list', () => {
    const v = List.of<string | undefined>('a', 'b', 'c')
      .push('d')
      .set(14, 'o')
      .set(6, undefined)
      .remove(1);
    expect(v.size).toBe(14);
    expect(v.toJS()).toEqual(['a', 'c', 'd', , , , , , , , , , , 'o']);
  });

  it('iterates a dense list', () => {
    const v = List()
      .setSize(11)
      .set(1, 1)
      .set(3, 3)
      .set(5, 5)
      .set(7, 7)
      .set(9, 9);
    expect(v.size).toBe(11);

    const forEachResults: Array<any> = [];
    v.forEach((val, i) => forEachResults.push([i, val]));
    expect(forEachResults).toEqual([
      [0, undefined],
      [1, 1],
      [2, undefined],
      [3, 3],
      [4, undefined],
      [5, 5],
      [6, undefined],
      [7, 7],
      [8, undefined],
      [9, 9],
      [10, undefined],
    ]);

    const arrayResults = v.toArray();
    expect(arrayResults).toEqual([
      undefined,
      1,
      undefined,
      3,
      undefined,
      5,
      undefined,
      7,
      undefined,
      9,
      undefined,
    ]);

    const iteratorResults: Array<any> = [];
    const iterator = v.entries();
    let step;
    while (!(step = iterator.next()).done) {
      iteratorResults.push(step.value);
    }
    expect(iteratorResults).toEqual([
      [0, undefined],
      [1, 1],
      [2, undefined],
      [3, 3],
      [4, undefined],
      [5, 5],
      [6, undefined],
      [7, 7],
      [8, undefined],
      [9, 9],
      [10, undefined],
    ]);
  });

  it('push inserts at highest index', () => {
    const v0 = List.of('a', 'b', 'c');
    const v1 = v0.push('d', 'e', 'f');
    expect(v0.size).toBe(3);
    expect(v1.size).toBe(6);
    expect(v1.toArray()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  check.it(
    'pushes multiple values to the end',
    { maxSize: 2000 },
    [gen.posInt, gen.posInt],
    (s1, s2) => {
      const a1 = arrayOfSize(s1);
      const a2 = arrayOfSize(s2);

      const v1 = List(a1);
      const v3 = v1.push.apply(v1, a2);

      const a3 = a1.slice();
      a3.push.apply(a3, a2);

      expect(v3.size).toEqual(a3.length);
      expect(v3.toArray()).toEqual(a3);
    }
  );

  it('pop removes the highest index, decrementing size', () => {
    let v = List.of('a', 'b', 'c').pop();
    expect(v.last()).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b']);
    v = v.set(1230, 'x');
    expect(v.size).toBe(1231);
    expect(v.last()).toBe('x');
    v = v.pop();
    expect(v.size).toBe(1230);
    expect(v.last()).toBe(undefined);
    v = v.push('X');
    expect(v.size).toBe(1231);
    expect(v.last()).toBe('X');
  });

  check.it(
    'pop removes the highest index, just like array',
    { maxSize: 2000 },
    [gen.posInt],
    len => {
      const a = arrayOfSize(len);
      let v = List(a);

      while (a.length) {
        expect(v.size).toBe(a.length);
        expect(v.toArray()).toEqual(a);
        v = v.pop();
        a.pop();
      }
      expect(v.size).toBe(a.length);
      expect(v.toArray()).toEqual(a);
    }
  );

  check.it(
    'push adds the next highest index, just like array',
    { maxSize: 2000 },
    [gen.posInt],
    len => {
      const a: Array<any> = [];
      let v = List();

      for (let ii = 0; ii < len; ii++) {
        expect(v.size).toBe(a.length);
        expect(v.toArray()).toEqual(a);
        v = v.push(ii);
        a.push(ii);
      }
      expect(v.size).toBe(a.length);
      expect(v.toArray()).toEqual(a);
    }
  );

  it('allows popping an empty list', () => {
    let v = List.of('a').pop();
    expect(v.size).toBe(0);
    expect(v.toArray()).toEqual([]);
    v = v.pop().pop().pop().pop().pop();
    expect(v.size).toBe(0);
    expect(v.toArray()).toEqual([]);
  });

  it.each(['remove', 'delete'])('remove removes any index', fn => {
    let v = List.of('a', 'b', 'c')[fn](2)[fn](0);
    expect(v.size).toBe(1);
    expect(v.get(0)).toBe('b');
    expect(v.get(1)).toBe(undefined);
    expect(v.get(2)).toBe(undefined);
    expect(v.toArray()).toEqual(['b']);
    v = v.push('d');
    expect(v.size).toBe(2);
    expect(v.get(1)).toBe('d');
    expect(v.toArray()).toEqual(['b', 'd']);
  });

  it('shifts values from the front', () => {
    const v = List.of('a', 'b', 'c').shift();
    expect(v.first()).toBe('b');
    expect(v.size).toBe(2);
  });

  it('unshifts values to the front', () => {
    const v = List.of('a', 'b', 'c').unshift('x', 'y', 'z');
    expect(v.first()).toBe('x');
    expect(v.size).toBe(6);
    expect(v.toArray()).toEqual(['x', 'y', 'z', 'a', 'b', 'c']);
  });

  check.it(
    'unshifts multiple values to the front',
    { maxSize: 2000 },
    [gen.posInt, gen.posInt],
    (s1, s2) => {
      const a1 = arrayOfSize(s1);
      const a2 = arrayOfSize(s2);

      const v1 = List(a1);
      const v3 = v1.unshift.apply(v1, a2);

      const a3 = a1.slice();
      a3.unshift.apply(a3, a2);

      expect(v3.size).toEqual(a3.length);
      expect(v3.toArray()).toEqual(a3);
    }
  );

  it('map no-ops return the same reference', () => {
    const v = List.of('a', 'b', 'c');
    const r = v.map(value => value);
    expect(r).toBe(v);
  });

  it('works with insert', () => {
    const v = List.of('a', 'b', 'c');
    const m = v.insert(1, 'd');
    expect(m.size).toBe(4);
    expect(m.get(1)).toBe('d');

    // Works when index is greater than size of array.
    const n = v.insert(10, 'e');
    expect(n.size).toBe(4);
    expect(n.get(3)).toBe('e');

    // Works when index is negative.
    const o = v.insert(-4, 'f');
    expect(o.size).toBe(4);
    expect(o.get(0)).toBe('f');
  });

  it('allows chained mutations', () => {
    const v1 = List();
    const v2 = v1.push(1);
    const v3 = v2.withMutations(v => v.push(2).push(3).push(4));
    const v4 = v3.push(5);

    expect(v1.toArray()).toEqual([]);
    expect(v2.toArray()).toEqual([1]);
    expect(v3.toArray()).toEqual([1, 2, 3, 4]);
    expect(v4.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('allows chained mutations using alternative API', () => {
    const v1 = List();
    const v2 = v1.push(1);
    const v3 = v2.asMutable().push(2).push(3).push(4).asImmutable();
    const v4 = v3.push(5);

    expect(v1.toArray()).toEqual([]);
    expect(v2.toArray()).toEqual([1]);
    expect(v3.toArray()).toEqual([1, 2, 3, 4]);
    expect(v4.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('chained mutations does not result in new empty list instance', () => {
    const v1 = List(['x']);
    const v2 = v1.withMutations(v => v.push('y').pop().pop());
    expect(v2).toBe(List());
  });

  it('calling `clear` and `setSize` should set all items to undefined', () => {
    const l = List(['a', 'b']);
    const l2 = l.clear().setSize(3);

    expect(l2.get(0)).toBeUndefined();
    expect(l2.get(1)).toBeUndefined();
    expect(l2.get(2)).toBeUndefined();
  });

  it('calling `clear` and `setSize` while mutating should set all items to undefined', () => {
    const l = List(['a', 'b']);
    const l2 = l.withMutations(innerList => {
      innerList.clear().setSize(3);
    });
    expect(l2.get(0)).toBeUndefined();
    expect(l2.get(1)).toBeUndefined();
    expect(l2.get(2)).toBeUndefined();
  });

  it('allows size to be set', () => {
    const v1 = Range(0, 2000).toList();
    const v2 = v1.setSize(1000);
    const v3 = v2.setSize(1500);
    expect(v1.size).toBe(2000);
    expect(v2.size).toBe(1000);
    expect(v3.size).toBe(1500);
    expect(v1.get(900)).toBe(900);
    expect(v1.get(1300)).toBe(1300);
    expect(v1.get(1800)).toBe(1800);
    expect(v2.get(900)).toBe(900);
    expect(v2.get(1300)).toBe(undefined);
    expect(v2.get(1800)).toBe(undefined);
    expect(v3.get(900)).toBe(900);
    expect(v3.get(1300)).toBe(undefined);
    expect(v3.get(1800)).toBe(undefined);
  });

  it('discards truncated elements when using slice', () => {
    const list = [1, 2, 3, 4, 5, 6];
    const v1 = fromJS(list) as List<number>;
    const v2 = v1.slice(0, 3);
    const v3 = v2.setSize(6);

    expect(v2.toArray()).toEqual(list.slice(0, 3));
    expect(v3.toArray()).toEqual(
      list.slice(0, 3).concat([undefined, undefined, undefined] as any)
    );
  });

  it('discards truncated elements when using setSize', () => {
    const list = [1, 2, 3, 4, 5, 6];
    const v1 = fromJS(list) as List<number>;
    const v2 = v1.setSize(3);
    const v3 = v2.setSize(6);

    expect(v2.toArray()).toEqual(list.slice(0, 3));
    expect(v3.toArray()).toEqual(
      list.slice(0, 3).concat([undefined, undefined, undefined] as any)
    );
  });
});
