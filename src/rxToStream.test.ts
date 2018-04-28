import {expect} from 'chai';
import {from, range, Observable, Subscriber} from 'rxjs';
import {reduce, map} from 'rxjs/operators';
import {
    rxToStream,
    streamToStringRx,
} from './index';

import { Readable } from 'stream';

describe('Validate to Stream', () => {
    it('rxToStream', () => {
        const data: string = 'This is a bit of text to have some fun with';
        const src = from(data.split(' '));
        const stream = rxToStream(src);

        const p = streamToStringRx(stream)
            .pipe(reduce((a, b) => a + ' ' + b))
            .toPromise()
            .then(result => {
                expect(result).to.equal(data);
            });

        return p;
    });

    it('rxToStream with error', () => {
        const src = Observable.create((observer: Subscriber<string>) => {
            setTimeout(() => observer.error(new Error('TEST_ERROR')), 1);
        });

        const stream = rxToStream(src, undefined, (err: Error, readable: Readable) => {
            readable.emit('error', err);
        });

        let errorCaught;
        stream.on('error', err => (errorCaught = err));

        const p = streamToStringRx(stream)
            .toPromise()
            .then(() => {
                expect(errorCaught).to.have.property('message', 'TEST_ERROR');
            })
            .catch(() => {});

        return p;
    });

    it('rxToStream with promise error', () => {
        const promise: Promise<string> = new Promise<string>((_: (value: string) => void, reject: (reason: string) => void) => {
            reject('TEST_ERROR');
        });
        const src = from(promise);

        const stream = rxToStream(src, undefined, (err: Error, readable: Readable) => {
            readable.emit('error', err);
        });

        let errorCaught;
        stream.on('error', err => (errorCaught = err));

        const p = streamToStringRx(stream)
            .toPromise()
            .then(() => {
                expect(errorCaught).to.have.property('message', 'TEST_ERROR');
            })
            .catch(() => {});

        return p;
    });

    it('rxToStream large range', () => {
        // This tests that we can send many small values to the stream on after another.
        // This is to make sure we do not run out of stack space.
        const max = 5000;
        const src = range(1, max);
        const stream = rxToStream(src.pipe(map(a => a.toString())));

        const p = streamToStringRx(stream).pipe(
            map(a => Number.parseInt(a)),
            reduce((a, b) => a + b),
        ).toPromise()
            .then(result => {
                expect(result).to.equal((max * (max + 1)) / 2);
            });

        return p;
    });
});
