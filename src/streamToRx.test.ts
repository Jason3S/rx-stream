import { expect } from 'chai';
import * as stream from 'stream';
import { reduce, tap } from 'rxjs/operators';
import { streamToStringRx } from './index';
import { BehaviorSubject, Subject } from 'rxjs';

describe('Validate Rx From Stream', () => {
    it('tests stream to Rx', async () => {
        const data = 'This is a bit of text to have some fun with';
        const bufferStream = new stream.PassThrough();
        bufferStream.end(data, 'utf8');
        const result = await streamToStringRx(bufferStream)
            .pipe(reduce((a, b) => a + b))
            .toPromise();
        expect(result).to.equal(data);
    });

    it('tests closing a stream', async () => {
        const data = 'This is a bit of text to have some fun with';
        const bufferStream = new stream.PassThrough();
        const observable = streamToStringRx(bufferStream);
        bufferStream.write(data, 'utf8');
        const result = observable.pipe(reduce((a, b) => a + b)).toPromise();
        bufferStream.destroy ? bufferStream.destroy() : bufferStream.end();
        expect(await result).to.equal(data);
    });

    it('should not be a subject', async () => {
        const data = 'Some sample text';
        const bufferStream = new stream.PassThrough();
        const observable = streamToStringRx(bufferStream, 'utf8');
        expect((observable as Subject<string>).next).not.to.be.a('function');
        bufferStream.end(data, 'utf8');
        const result = await observable.pipe(reduce((a, b) => a + b)).toPromise();
        expect(result).to.equal(data);
    });

    it('tests stream pause', (done) => {
        const data = 'This is a bit of text to have some fun with';
        const bufferStream = new stream.PassThrough();
        const delayTime = 20;

        const pauser = new BehaviorSubject<boolean>(false);
        bufferStream.write(data.slice(0, data.length / 2), 'utf8');
        setTimeout(() => {
            bufferStream.end(data.slice(data.length / 2), 'utf8');
        }, delayTime);

        streamToStringRx(bufferStream, 'utf8', pauser)
            .pipe(
                tap(() => {
                    if (pauser.value === true) {
                        throw new Error('should be paused');
                    }
                    pauser.next(true);
                }),
                tap(() => {
                    setTimeout(() => {
                        pauser.next(false);
                    }, delayTime * 2);
                }),
                reduce((a, b) => a + b)
            )
            .subscribe({
                next: (result) => {
                    expect(result).to.equal(data);
                },
                complete: () => {
                    done();
                },
                error: (err) => {
                    done(err);
                },
            });
    });
});
