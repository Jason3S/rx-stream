import {expect} from 'chai';
import * as stream from 'stream';
import {
    streamToStringRx
} from './index';

describe('Validate Rx From Stream', () => {
    it('tests stream to Rx', () => {
        const data: string = 'This is a bit of text to have some fun with';
        const bufferStream = new stream.PassThrough();
        bufferStream.end(data);
        return streamToStringRx(bufferStream)
            .reduce((a, b) => a + b)
            .toPromise()
            .then(result => {
                expect(result).to.equal(data);
            });
    });

});
