import { expect } from 'chai';
import { Subject, interval } from 'rxjs';
import { take, tap, bufferWhen, toArray, zip } from 'rxjs/operators';

describe('Experiment with Observable buffer', function () {
    this.timeout(10000);

    it('Demonstrates a bug with bufferWhen', () => {
        const src = interval(5).pipe(take(10));
        const intervalRx = interval(1000);
        const trigger = new Subject<number>();

        intervalRx.pipe(tap((n) => console.log(`Trigger ${n}`))).subscribe(trigger);

        return src
            .pipe(
                bufferWhen(() => trigger),
                tap((v) => console.log(v)),
                toArray()
            )
            .toPromise()
            .then((values) => {
                console.log(values);
                console.log('done.');
            });
        // Actual output:
        // [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
        // [ [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ]
        // done.

        // Expected output:
        // Trigger 0
        // [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
        // [ [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ]
        // done.
    });

    it('Demonstrates a bug with zip', () => {
        const slow = interval(10).pipe(take(10));
        const fast = interval(3);

        return slow
            .pipe(zip(fast), toArray())
            .toPromise()
            .then((values) => {
                console.log(values);
                values.forEach(([s, f]) => expect(s).to.be.equal(f));
            });
    });
});
