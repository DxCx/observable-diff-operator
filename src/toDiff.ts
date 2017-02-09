import { diff } from 'deep-diff';
import { IObservableDiff, Observer } from './interfaces';

export function toDiffObserver<T>(observer: Observer<IObservableDiff>): Observer<T> {
  let _count: number = 0;
  let _lastValue: any;
  let _isObject: boolean = false;

  return {
    /** onComplete hook. */
    complete: () => {
      /* emit the complete message, then complete the observable */
      observer.next({type: 'complete'});
      observer.complete();
    },
    /** onError hook. */
    error: (e: Error) => {
      /* emit the error message, then complete the observable */
      observer.next({type: 'error', payload: e.message});
      observer.complete();
    },
    /** onNext hook. */
    next: (value: T) => {
      /* is this the first message? */
      if ( 0 === _count ) {
        /* check for isObject property */
        _isObject = (typeof value === 'object');
        /* emit the init message */
        observer.next({type: 'init', payload: value, isObject: _isObject});
      } else if ( _isObject ) {
        /* this is an object, sending diff update */
        observer.next({type: 'update', payload: diff(_lastValue, value)});
      } else {
        /* this is a simple value, sending as-is */
        observer.next({type: 'update', payload: value});
      }

      _lastValue = value;
      _count ++;
    },
  };
}
