# observable-diff-operator

[![Greenkeeper badge](https://badges.greenkeeper.io/DxCx/observable-diff-operator.svg)](https://greenkeeper.io/)
[![NPM version](https://img.shields.io/npm/v/observable-diff-operator.svg)](https://www.npmjs.com/package/observable-diff-operator)
[![Build Status](https://travis-ci.org/DxCx/observable-diff-operator.svg?branch=master)](https://travis-ci.org/DxCx/observable-diff-operator)
[![Coverage Status](https://coveralls.io/repos/github/DxCx/observable-diff-operator/badge.svg?branch=master)](https://coveralls.io/github/DxCx/observable-diff-operator?branch=master)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)

this is fromDiff / toDiff logic implementation for observables.

those operators are meant for sending observables over network:
![Example diagram](./diagram.png)

## Wrapping observers for Examples
to use the logic, you will need to simply wrap observables
using your observables implementation, for example, RxJs:

```typescript
import { Observable } from 'rxjs';
import { fromDiffObserver, IObservableDiff, toDiffObserver } from 'observable-diff-operator';

export function fromDiffWrap<T>(obs: Observable<IObservableDiff>): Observable<T> {
  return new Observable((observer) => {
    return obs.subscribe(fromDiffObserver(observer));
  });
}

export function toDiffWrap<T>(obs: Observable<T>): Observable<IObservableDiff> {
  return new Observable((observer) => {
    return obs.subscribe(toDiffObserver(observer));
  });
}
```

NOTE: for `rxjs`, [rxjs-diff-operator](https://www.github.com/DxCx/rxjs-diff-operator) will give the same result but as embeded operator
instead of converting observables.

## Operators:
### toDiff
#### signature: `toDiffObserver<T>(Observer<IObservableDiff>): Observer<T>`
#### Description

toDiff operator is used to convert output of an obsersvable stream,
into a stream that contains diff information.
this operator is inteded to be used on the server.

##### Example

```typescript
//emit (1,2,3,4,5)
const source = Rx.Observable.from([1,2,3,4,5]);
//add 10 to each value
const example = toDiffWrap(source);
//output: { type: "init", payload: 1, isObject: false }, { type: "update", payload: 2 }, ...
const subscribe = example.subscribe(val => console.log(val));
```

### fromDiff
##### signature: `fromDiffObserver<T>(Observer<T>): Observable<IObservableDiff>`
#### Description

fromDiff operator is used to convert output of an diff obsersvable stream (see toDiff above),
into a stream that contains diff information.
this operator is inteded to be used on the client.

##### Example

```typescript
//emit diff information
const source = Rx.Observable.from([{ type: "init", payload: 1, isObject: false }, { type: "update", payload: 2 }, { type: "complete" }]);
//add 10 to each value
const example = fromDiffWrap(source);
//output: 1, 2
const subscribe = example.subscribe(val => console.log(val));
```

## Deep-Dive:
### Protocol
the protocol contains 4 message types:
  - init
    - must be the first message on the line.
    - contains isObject property which represents the payload type on the stream.
    - contains intial payload (not a diff)
  - update
    - sent for each next on the original observable
    - contains payload property as raw value (simple values) or diff object (objects/arrays)
  - error
    - sent for errors on the original observable
    - contains payload of error message
  - complete
    - sent when original observable is complete.

### Handling Objects:
diffing simple values is not efficient, the real power of this operator comes when
dealing with array or objects.
for that, [deep-diff](https://www.npmjs.com/package/deep-diff) is being used.

### Object example:
given the input of:
```json
{
  "value": 1,
},
{
  "value": 2,
},
{
  "value": 3,
},
{
  "value": 4,
},
{
  "value": 5,
},
```
this output will be emitted:
```json
{
    "isObject": true,
    "payload": {
        "value": 1,
    },
    "type": "init",
}, {
    "payload": [
        {
            "kind": "E",
            "lhs": 1,
            "path": [
                "value",
            ],
            "rhs": 2,
        },
    ],
    "type": "update",
}, {
    "payload": [
        {
            "kind": "E",
            "lhs": 2,
            "path": [
                "value",
            ],
            "rhs": 3,
        },
    ],
    "type": "update",
}, {
    "payload": [
        {
            "kind": "E",
            "lhs": 3,
            "path": [
                "value",
            ],
            "rhs": 4,
        },
    ],
    "type": "update",
}, {
    "payload": [
        {
            "kind": "E",
            "lhs": 4,
            "path": [
                "value",
            ],
            "rhs": 5,
        },
    ],
    "type": "update",
}, {
    "type": "complete",
}
```
### Observable with an error example:
given the input of:
```typescript
let obs: Observable<{ value: number }> = Observable.of(1, 2, 3, 4, 5)
.map((v: number, i: number) => {
    if ( i === 2 ) {
        throw new Error('testing errors');
    }

    return { value: v };
});
```
this output will be emitted:
```json
{
    "isObject": true,
    "payload": {
        "value": 1,
    },
    "type": "init",
}, {
    "payload": [
        {
            "kind": "E",
            "lhs": 1,
            "path": [
                "value",
            ],
            "rhs": 2,
        },
    ],
    "type": "update",
}, {
    "payload": "testing errors",
    "type": "error",
}
```
## Contributions

Contributions, issues and feature requests are very welcome. If you are using this package and fixed a bug for yourself, please consider submitting a PR!
