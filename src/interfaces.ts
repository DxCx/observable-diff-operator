export type IObservableDiffType = 'init' | 'update' | 'error' | 'complete';

export interface Observer<T> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface IObservableDiff {
    type: IObservableDiffType;
    payload?: any;
    isObject?: boolean;
}
