import {expect} from 'chai';
import * as stream from 'stream';
import { reduce, tap } from 'rxjs/operators';
import { streamToStringRx } from './index';
import { BehaviorSubject } from 'rxjs';

describe('Validate Rx From Stream', () => {
    it('tests stream to Rx', () => {
        const data: string = 'This is a bit of text to have some fun with';
        const bufferStream = new stream.PassThrough();
        bufferStream.end(data, 'utf8');
        return streamToStringRx(bufferStream)
            .pipe(reduce((a, b) => a + b))
            .toPromise()
            .then(result => {
                expect(result).to.equal(data);
            });
    });

    it('tests closing a stream', async () => {
        const data: string = 'This is a bit of text to have some fun with';
        const bufferStream = new stream.PassThrough();
        const observable = streamToStringRx(bufferStream);
        bufferStream.write(data, 'utf8');
        const result = observable
            .pipe(reduce((a, b) => a + b))
            .toPromise();
        bufferStream.destroy ? bufferStream.destroy() : bufferStream.end();
        expect(await result).to.equal(data);
    });

    it('should not be a subject', async () => {
        const data = 'Some sample text';
        const bufferStream = new stream.PassThrough();
        const observable = streamToStringRx(bufferStream, 'utf8');
        expect((observable as any).next).not.to.be.a('function');
        bufferStream.end(data, 'utf8');
        const result = await observable
            .pipe(reduce((a, b) => a + b))
            .toPromise();
        expect(result).to.equal(data);
    });

    it('tests stream pause', done => {
        const data: string = 'This is a bit of text to have some fun with';
        const bufferStream = new stream.PassThrough();
        const timegap = 20;

        const pauser = new BehaviorSubject<boolean>(false);
        bufferStream.write(data.slice(0, data.length / 2), 'utf8');
        setTimeout(() => {
            bufferStream.end(data.slice(data.length / 2), 'utf8');
        }, timegap);

        return streamToStringRx(bufferStream, 'utf8', pauser)
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
                    }, timegap * 2);
                }),
                reduce((a, b) => a + b)
            )
            .subscribe({
                next: result => {
                    expect(result).to.equal(data);
                },
                complete: () => {
                    done();
                },
                error: err => {
                    done(err);
                }
            });
    });

});
