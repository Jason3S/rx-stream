import {expect} from 'chai';
import * as Rx from 'rxjs/Rx';
import {ISuiteCallbackContext} from 'mocha';

const outputLog = false;

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
            .do(x => log(x))
            .take(100)
            .toArray()
            .toPromise()
            .then(numbers => {
                log(numbers.join(', '));
                const sum = numbers.reduce((a, b) => a + b, 0);
                // Make sure the sum adds up to the sum of number from 1 to 100.
                expect(sum).to.be.equal((100 * 101) / 2);
                stop.unsubscribe();
            });

        pauser.next(false);
        inputSrc.subscribe(source);

        return p;
    });
});

function log(message: any, ...args: any[]) {
    if (outputLog) {
        console.log(message, ...args);
    }
}
