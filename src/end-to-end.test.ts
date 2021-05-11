import { expect } from 'chai';
import { range } from 'rxjs';
import { map, tap, toArray } from 'rxjs/operators';
import { rxToStream, streamToRx } from './index';
import { loremIpsum } from 'lorem-ipsum';

interface AStreamObject {
    text: string;
}

describe('Validate end-to-end test', () => {
    it('rx-stream-rx', async () => {
        const record: AStreamObject[] = [];

        const max = 50;
        const src = range(1, max).pipe(
            map(() => loremIpsum({ count: 100, format: 'plain', units: 'words' })),
            map((text) => ({ text })),
            tap((s) => record.push(s))
        );
        const result = await streamToRx<AStreamObject>(rxToStream(src, { objectMode: true }))
            .pipe(toArray())
            .toPromise();
        expect(result).to.deep.equal(record);
    });
});
