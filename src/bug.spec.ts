import {expect} from 'chai';
import * as Rx from 'rxjs/Rx';
import {ISuiteCallbackContext} from 'mocha';

describe('Experiment with Observable buffer', function (this: ISuiteCallbackContext) {
    this.timeout(10000);

    it('Demonstrates a bug with bufferWhen', () => {
        const src = Rx.Observable.interval(5).take(10);
        const interval = Rx.Observable.interval(1000);
        const trigger = new Rx.Subject<number>();

        interval
            .do(n => console.log(`Trigger ${n}`))
            .subscribe(trigger);

        return src
            .bufferWhen(() => trigger)
            .do(v => console.log(v))
            .toArray()
            .toPromise()
            .then(values => {
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
        const slow = Rx.Observable.interval(10).take(10);
        const fast = Rx.Observable.interval(3);

        return slow
            .zip(fast)
            .toArray()
            .toPromise()
            .then(values => {
                console.log(values);
                values.forEach(([s, f]) => expect(s).to.be.equal(f));
            });
    });
});

