import {expect} from 'chai';
import * as Rx from 'rxjs/Rx';
import {makePausable, makePausableBuffered} from './pausable';
import {ISuiteCallbackContext} from 'mocha';
import * as M from './monitor';

const outputLog = true;
M.enabledLogging();

describe('Experiment with pausable Observable', function (this: ISuiteCallbackContext) {
    this.timeout(10000);

    it('Test using switchMap', () => {
        const inputSrc = Rx.Observable.range(1, 1000);
        const source = new Rx.Subject<number>();
        const pauser = new Rx.Subject();

        // All the magic is here
        const pausable = pauser.switchMap<{}, number>(paused => paused ? Rx.Observable.never() : source);

        let toggle = false;
        const stop = Rx.Observable.interval(100).subscribe(() => {
            toggle = !toggle;
            pauser.next(toggle);
        });

        const p = pausable
            // .do(x => log(x))
            .take(100)
            .toArray()
            .toPromise()
            .then(numbers => {
                // log(numbers.join(', '));
                const sum = numbers.reduce((a, b) => a + b, 0);
                // Make sure the sum adds up to the sum of number from 1 to 100.
                expect(sum).to.be.equal((100 * 101) / 2);
                stop.unsubscribe();
            });

        pauser.next(toggle);
        inputSrc.subscribe(source);

        return p;
    });

    it('Tests the makePausable method', () => {
        const pauser = Rx.Observable.interval(50).map(v => !!(v & 1));
        const pausable = makePausable(Rx.Observable.interval(20), pauser);

        const p = pausable
            .do(a => log(a))
            .take(5)
            .toArray()
            .toPromise()
            .then(values => {
                expect(values.reduce((a, b) => a + b, 0)).not.to.be.equal(15);
            });

        return p;

    });

    it('Tests the makePausableBuffered method', () => {
        let isPaused = true;
        const pauser = Rx.Observable.interval(47).map(v => !(v & 1)).do(a => isPaused = a);
        const src = new Rx.Subject<number>();
        const pausable = makePausableBuffered(src, pauser);

        const p = pausable
            .do(a => isPaused ? M.logTs(`XXXXX - ${a}`) : 0)
            .take(50)
            .toArray()
            .toPromise()
            .then(values => {
                log(values.join(', '));
                expect(values.reduce((a, b) => a + b, 0)).to.be.equal((29 * 30) / 2);
            });

        // Rx.Observable.range(1, 1000).subscribe(src);
        Rx.Observable.interval(20).take(30).subscribe(src);

        return p;

    });

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
});

function log(message: any, ...args: any[]) {
    if (outputLog) {
        M.log(message, ...args);
    }
}
