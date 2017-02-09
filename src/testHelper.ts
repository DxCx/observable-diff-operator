import { Observable } from 'rxjs';
import { fromDiffObserver } from './fromDiff';
import { IObservableDiff } from './interfaces';
import { toDiffObserver } from './toDiff';

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
