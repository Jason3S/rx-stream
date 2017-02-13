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

    it('rxToStream large range', () => {
        // This tests that we can send many small values to the stream on after another.
        // This is to make sure we do not run out of stack space.
        const max = 5000;
        const src = Rx.Observable.range(1, max);
        const stream = rxToStream(src.map(a => a.toString()));

        const p = streamToStringRx(stream)
            .map(a => Number.parseInt(a))
            .reduce((a, b) => a + b)
            .toPromise()
            .then(result => {
                expect(result).to.equal((max * (max + 1)) / 2);
            });

        return p;
    });
});
