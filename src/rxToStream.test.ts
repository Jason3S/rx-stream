import {expect} from 'chai';
import * as Rx from 'rxjs/Rx';
import {
    rxToStream,
    streamToStringRx,
} from './index';

describe('Validate to Stream', () => {
    it('rxToStream', () => {
        const data: string = 'This is a bit of text to have some fun with';
        const src = Rx.Observable.from(data.split(' '));
        const stream = rxToStream(src);

        const p = streamToStringRx(stream)
            .reduce((a, b) => a + ' ' + b)
            .toPromise()
            .then(result => {
                expect(result).to.equal(data);
            });

        return p;
    });
});
