'use strict';

import 'jest';

import { Observable } from 'rxjs';
import { fromDiffWrap, toDiffWrap } from './testHelper';

describe('diff operator combined', () => {
    it.only('works togather', () => {
        let obs: Observable<number> = Observable.of(1, 2, 3, 4, 5);

        return fromDiffWrap(toDiffWrap(obs)).bufferCount(6).toPromise().then((msgs) => {
            expect(typeof msgs).toBe('object');
            expect(msgs).toMatchSnapshot();
        });
    });
});
