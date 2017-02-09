import * as clone from 'clone';
import { applyChange } from 'deep-diff';
import * as deepFreeze from 'deep-freeze';
import { IObservableDiff } from './interfaces';
import { Observer } from './interfaces';

export function fromDiffObserver<T>(observer: Observer<T>): Observer<IObservableDiff> {
  let _count: number = 0;
  let _lastValue: any;
  let _isObject: boolean = false;

  /** emits a new value, while saving it for patching in the future */
  function _emitValue(newValue: any) {
    _lastValue = clone(newValue);
    if ( _isObject ) {
      deepFreeze(_lastValue);
    }

    observer.next(_lastValue);
  }

  /** general message handler */
  function _process_diff({type, payload}: IObservableDiff) {
    switch ( type ) {
      case 'init':
        /* init message cannot be sent more then once. */
        observer.error(new Error('Init message emitted while in sequance'));
        break;
      case 'update':
        /* update message */
        let copyValue = payload;
        if ( _isObject ) {
          copyValue = clone(_lastValue);
          payload.forEach((changeset: any) => {
            applyChange(copyValue, true, changeset);
          });
        };
        _emitValue(copyValue);
        break;
     case 'error':
       /* error message, throw it */
       observer.error(new Error(payload));
       break;
     case 'complete':
       /* complete message, completes the observable */
       observer.complete();
       break;
     default:
       observer.error(new Error('unexpected message'));
       break;
      }
  }

  /** init message handler */
  function _process_init({type, payload, isObject}: IObservableDiff) {
    /* if the first message is not init message, throw error. */
    if ( type !== 'init') {
      observer.error(new Error('Init message was not emitted.'));
      return;
    }
    _isObject = isObject;

    _emitValue(payload);
  }

  return {
    complete: observer.complete,
    error: observer.error,
    next: (value: IObservableDiff) => {
      if ( 0 === _count ) {
        /* start init sequance. */
        _process_init(value);
      } else {
        /* general message processing */
        _process_diff(value);
      }
      _count ++;
    },
  };
}
