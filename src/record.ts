import { ValueType } from "./node.js";
// NOTE, WE SHOULD HAVE OTHER RECORD STATIC METHODS HERE LIEKLY
// NOTE, WE NEED TO UPDAGE STIBLIB FUNCTIONS TOO
export interface RecordVal {
  type: ValueType;
  value: string;
}

// THis is a dual array dequeue to make pushing/popping from either side faster
export class RecordTape {
  private front: RecordVal[];
  private back: RecordVal[];

  constructor() {
    this.front = [];
    this.back = [];
  }

  public size() {
    return this.front.length + this.back.length;
  }

  public get(i: number): RecordVal | null {
    // Convert negative indexes to positive
    const index = this.negToPositiveIndex(i, false);
    if (index == null) return null;

    if (index < this.front.length) {
      return this.front[this.front.length - index - 1];
    } else {
      return this.back[index - this.front.length];
    }
  }

  public set(i: number, val: RecordVal): RecordVal | null {
    // Convert negative indexes to positive
    const index = this.negToPositiveIndex(i, false);
    if (index == null) return null;

    const returnValue = this.get(index);

    if (index < this.front.length) {
      this.front[this.front.length - index - 1] = val;
    } else {
      this.back[index - this.front.length] = val;
    }
    return returnValue;
  }

  public add(i: number, val: RecordVal): boolean {
    const index = this.negToPositiveIndex(i, true);
    if (index == null) return false;
    if (index < this.front.length) {
      this.front.splice(this.front.length - index, 0, val);
    } else {
      this.back.splice(index - this.front.length, 0, val);
    }
    this.balance();
    return true;
  }

  public remove(i: number): RecordVal | null {
    const index = this.negToPositiveIndex(i, false);
    if (index == null) return null;

    let returnVal: RecordVal[];
    if (index < this.front.length) {
      returnVal = this.front.splice(this.front.length - index - 1, 1);
    } else {
      returnVal = this.back.splice(index - this.front.length, 1);
    }
    this.balance();
    return returnVal[0];
  }

  public addFirst(val: RecordVal) {
    return this.add(0, val);
  }
  public addLast(val: RecordVal) {
    return this.add(this.size(), val);
  }
  public removeFirst() {
    return this.remove(0);
  }
  public removeLast() {
    return this.remove(this.size() - 1);
  }

  private negToPositiveIndex(i: number, adding: boolean): number | null {
    const index = i < 0 ? this.size() + i : i;
    if (index < 0 || index > this.size() || (!adding && index == this.size())) {
      return null;
    }
    return index;
  }

  private balance() {
    let n = this.size();
    if (n < 2) return;
    if (3 * this.front.length < this.back.length) {
      let s = Math.floor(n / 2 - this.front.length);
      const l1: RecordVal[] = this.back.slice(0, s).reverse();
      l1.splice(l1.length, 0, ...this.front);
      const l2: RecordVal[] = this.back.slice(s);
      this.front = l1;
      this.back = l2;
    } else if (3 * this.back.length < this.front.length) {
      let s = Math.floor(n / 2 - this.front.length);
      const l1: RecordVal[] = this.front.slice(s, this.front.length);
      const l2: RecordVal[] = this.front.slice(0, s).reverse();
      l2.splice(l2.length, 0, ...this.back);
      this.front = l1;
      this.back = l2;
    }
  }

  /* HELPER FUNCTIONS */
  public getRecord() {
    return this.front.reverse().concat(this.back);
  }

  public setRecord(values: RecordVal[]) {
    this.front = [];
    this.back = [];
    if (values.length == 0) return;
    const half = Math.floor(values.length / 2);
    for (let i = half; i >= 0; i--) {
      this.front.push(values[i]);
    }
    for (let i = half + 1; i < values.length; i++) {
      this.back.push(values[i]);
    }
  }

  public reverse() {
    let tempArr = this.front;
    this.front = this.back;
    this.back = tempArr;
  }
}
