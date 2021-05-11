import { expect } from 'chai';
import { from, range, Observable, Subscriber, timer, Subscription } from 'rxjs';
import { reduce, map, concatMap, take, finalize } from 'rxjs/operators';
import { rxToStream, streamToStringRx } from './index';
import { loremIpsum } from 'lorem-ipsum';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import * as fs from 'fs-extra';
import * as stream from 'stream';

import { Readable } from 'stream';

describe('Validate to Stream', () => {
    it('rxToStream', async () => {
        const data = 'This is a bit of text to have some fun with';
        const src = from(data.split(' '));

        const injectedSubscription = new Subscription();

        const originalSubscribe = src.subscribe.bind(src);

        const mockedSubscribe = ((...params: Parameters<typeof src.subscribe>) => {
            injectedSubscription.add(originalSubscribe(...params));
            return injectedSubscription;
        }) as typeof src.subscribe;

        src.subscribe = mockedSubscribe;

        const stream = rxToStream(src);

        const result = await streamToStringRx(stream)
            .pipe(
                reduce((a, b) => a + ' ' + b),
                finalize(() => {
                    // destroy source stream as this would be done by conventional stream api's
                    // like https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback
                    stream.destroy();
                })
            )
            .toPromise();
        expect(result).to.equal(data);
        expect(injectedSubscription.closed).to.be.true;
    });

    it('rxToStream with error', async () => {
        const src = Observable.create((observer: Subscriber<string>) => {
            setTimeout(() => observer.error(new Error('TEST_ERROR')), 1);
        });

        const stream = rxToStream(src, undefined, (err: Error, readable: Readable) => {
            readable.emit('error', err);
        });

        let errorCaught;
        stream.on('error', (err) => (errorCaught = err));

        const r = await streamToStringRx(stream)
            .toPromise()
            .then(
                () => true,
                () => false
            );
        expect(r).to.be.false;
        expect(errorCaught).to.have.property('message', 'TEST_ERROR');
    });

    it('rxToStream with promise error', async () => {
        // eslint-disable-next-line promise/param-names
        const promise: Promise<string> = new Promise<string>((_resolve: (value: string) => void, reject: (reason: Error) => void) => {
            reject(new Error('TEST_ERROR'));
        });
        const src = from(promise);

        const stream = rxToStream(src, undefined, (err: Error, readable: Readable) => {
            readable.emit('error', err);
        });

        let errorCaught;
        stream.on('error', (err) => (errorCaught = err));

        const r = await streamToStringRx(stream)
            .toPromise()
            .then(
                () => true,
                () => false
            );
        expect(r).to.be.false;
        expect(errorCaught).to.have.property('message', 'TEST_ERROR');
    });

    it('tests with a delayed hot observable', async () => {
        // This tests that we can send many small values to the stream one after another.
        // This is to make sure we do not run out of stack space.
        const max = 5;
        const src = timer(10, 1).pipe(take(max + 1));
        const stream = rxToStream(src.pipe(map((a) => a.toString())));

        const result = await streamToStringRx(stream)
            .pipe(
                map((a) => Number.parseInt(a)),
                reduce((a, b) => a + b)
            )
            .toPromise();
        expect(result).to.equal((max * (max + 1)) / 2);
    });

    it('rxToStream large range', async () => {
        // This tests that we can send many small values to the stream one after another.
        // This is to make sure we do not run out of stack space.
        const max = 5000;
        const src = range(1, max);
        const stream = rxToStream(src.pipe(map((a) => a.toString())));

        const result = await streamToStringRx(stream)
            .pipe(
                map((a) => Number.parseInt(a)),
                reduce((a, b) => a + b)
            )
            .toPromise();
        expect(result).to.equal((max * (max + 1)) / 2);
    });

    it('tests writing an Observable and reading it back.', async () => {
        // cspell:ignore éåáí
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '..', 'temp', 'tests-writing-an-observable.txt');

        const result = await from(mkdirp(path.dirname(filename)))
            .pipe(
                concatMap(() => writeToFileRxP(filename, from(data))),
                concatMap(() => fs.readFile(filename)),
                map((buffer) => buffer.toString()),
                reduce((a, b) => a + b)
            )
            .toPromise();
        expect(result).to.equal(text);
    });

    function writeToFileRx(filename: string, data: Observable<string>): fs.WriteStream {
        const sourceStream = rxToStream(data);

        const writeStream = fs.createWriteStream(filename);
        const zip = new stream.PassThrough();

        return sourceStream.pipe(zip).pipe(writeStream);
    }

    function writeToFileRxP(filename: string, data: Observable<string>): Promise<void> {
        const stream = writeToFileRx(filename, data);
        return new Promise<void>((resolve, reject) => {
            let resolved = false;
            const complete = () => {
                if (!resolved) resolve();
                resolved = true;
            };

            stream.on('finish', complete);
            stream.on('error', (e: Error) => reject(e));
            stream.on('close', complete);
        });
    }
});
