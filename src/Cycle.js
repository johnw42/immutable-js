import { wholeSlice, resolveBegin, resolveEnd } from './TrieUtils';
import { IndexedSeq } from './Seq';
import { is } from './is';
import { Iterator, iteratorValue, iteratorDone } from './Iterator';
import { List } from './List';

import deepEqual from './utils/deepEqual';
import { Range } from './Range';

function unsupported(name) {
  throw Error(`Cycle does not support ${name}`);
}

/**
 * Returns a lazy Seq of values in `items` repeated indefinitely.
 */
export class Cycle extends IndexedSeq {
  constructor(items, startIndex) {
    if (!(this instanceof Cycle)) {
      return new Cycle(items, startIndex);
    }
    this._items = IndexedSeq(items);
    if (this._items.isEmpty()) {
      throw Error('cannot traverse Cycle of empty collection');
    }

    this._startIndex = startIndex;
    this.size = Infinity;
  }

  __next(iterator) {
    iterator = iterator || this._items.skip(this._startIndex).__iterator();
    let result = iterator.next();
    if (result.done) {
      iterator = this._items.__iterator();
      result = iterator.next();
      if (!result.done) {
        throw Error('unexpected end of iteration');
      }
    }
    return { value: result.value, iterator };
  }

  __singleCycle() {
    if (this._startIndex === 0) {
      return this._items;
    }
    return List()
      .withMutations(result => {
        for (const value of this._items.skip(this._startIndex)) {
          result.push(value);
        }
        for (const value of this._items.take(this._startIndex)) {
          result.push(value);
        }
      })
      .toSeq();
  }

  toString() {
    return this.__toString('Cycle [', ']');
  }

  butLast() {
    return this;
  }

  concat() {
    return this;
  }

  count(predicate) {
    if (predicate) {
      unsupported('count with a predicate argument');
    }
    return Infinity;
  }

  countBy() {
    // It's tempting to call countBy on this._items and map any nonzero values
    // to Infinity, but this is potentially incorrect when the predicate is not
    // a pure function.
    unsupported('countBy');
  }

  equals() {
    unsupported('equals');
  }

  every() {
    unsupported('every');
  }

  findLast() {
    unsupported('findLast');
  }

  findLastEntry() {
    unsupported('findLastEntry');
  }

  findLastIndex() {
    unsupported('findLastIndex');
  }

  findLastKey() {
    unsupported('findLastKey');
  }

  groupBy() {
    // See comment in countBy.
    unsupported('groupBy');
  }

  has() {
    return true;
  }

  hashCode() {
    unsupported('hashCode');
  }

  includes(value) {
    return this._items.includes(value);
  }

  indexOf(value) {
    return this.__singleCycle().indexOf(value);
  }

  isEmpty() {
    return false;
  }

  isSubset(iter) {
    return this._items.isSubset(iter);
  }

  isSuperset(iter) {
    return this._items.isSuperset(iter);
  }

  join() {
    unsupported('join');
  }

  keyOf(searchValue) {
    return this.__singleCycle().keyOf(searchValue);
  }

  keySeq() {
    return new Range(0, Infinity);
  }

  keys() {
    return this.keySeq().__iterator();
  }

  last() {
    unsupported('last');
  }

  lastIndexOf() {
    unsupported('lastIndexOf');
  }

  lastKeyOf() {
    unsupported('lastKeyOf');
  }

  max() {
    return this._items.max();
  }

  maxBy() {
    unsupported('maxBy');
  }

  min() {
    return this._items.min();
  }

  minBy() {
    unsupported('minBy');
  }

  reduce() {
    unsupported('reduce');
  }

  reduceRight() {
    unsupported('reduceRight');
  }

  reverse() {
    // It's tempting to return Cycle(this._items.reverse()), but that's
    // incorrect because an infinite sequence has no end, so there can be no
    // starting point for the reversed sequence.
    unsupported('reverse');
  }

  some() {
    // Can't be implemented correctly for non-pure predicates.
    unsupported('some');
  }

  sort() {
    unsupported('sort');
  }

  sortBy() {
    unsupported('sortBy');
  }

  takeLast() {
    unsupported('takeLast');
  }

  __iterate(fn, reverse) {
    if (reverse) {
      unsupported('reverse iteration');
    }
    let i = 0;
    let iterator;
    while (i !== this.size) {
      const { iterator: nextIterator, value } = this.__next(iterator);
      if (fn(value, i++, this) === false) {
        break;
      }
      iterator = nextIterator;
    }
    return i;
  }

  __iterator(type, reverse) {
    if (reverse) {
      unsupported('reverse iteration');
    }
    let i = 0;
    let iterator;
    return new Iterator(() => {
      const { iterator: nextIterator, value } = this.__next(iterator);
      iterator = nextIterator;
      return iteratorValue(type, i++, value);
    });
  }
}

let EMPTY_CYCLE;
