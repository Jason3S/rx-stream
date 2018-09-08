import {expect} from 'chai';
import {from, range, Observable, Subscriber} from 'rxjs';
import {reduce, map, concatMap} from 'rxjs/operators';
import {
    rxToStream,
    streamToStringRx,
} from './index';
import * as loremIpsum from 'lorem-ipsum';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import * as fs from 'fs-extra';
import * as stream from 'stream';

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
        // This tests that we can send many small values to the stream one after another.
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

    it('tests writing an Observable and reading it back.', function() {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing-an-observable.txt');

        return from(mkdirp(path.dirname(filename))).pipe(
            concatMap(() => writeToFileRxP(filename, from(data))),
            concatMap(() => fs.readFile(filename) ),
            map(buffer => buffer.toString()),
            reduce((a, b) =>  a + b),
        ).toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
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
