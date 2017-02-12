import * as Rx from 'rxjs/Rx';
import * as M from './monitor';

/**
 * These methods came from the discussion here: https://github.com/ReactiveX/rxjs/issues/1542
 */

/**
 * Returns an Observable whose flow is controlled by pauser.
 *
 * By default, the observable is paused.  Any values that appear on the src Observable are lost while paused.
 *
 * Note: this only works on HOT Observables.  Cold observables will instantly consumed.
 */
export function makePausable<T>(src: Rx.Observable<T>, pauser: Rx.Observable<boolean>): Rx.Observable<T> {
    const source = new Rx.Subject<T>();

    // All the magic is here
    const pausable  = pauser.switchMap<boolean, T>(paused => paused ? Rx.Observable.never() : source);

    src.subscribe(source);

    return pausable;
}


/**
 *
 */
export function makePausableBuffered<T>(src: Rx.Observable<T>, pauser: Rx.Observable<boolean>): Rx.Observable<T> {
    const source = new Rx.Subject<T>();
    const buffer = new Rx.Subject<T>();
    const pausable = new Rx.Subject<T>();
    const pauserSrc = new Rx.Subject<boolean>();
    const triggerBuf = new Rx.Subject<boolean>();

    pauserSrc
        .distinctUntilChanged()
        .do(a => M.logTs(`TriggerX: ${a ? 'Yes' : 'No'}`))
        .subscribe(triggerBuf);

    // Setup the buffer
    source
        .do(v => M.logTs(`P - ${v}`))
        .bufferWhen(() => {
            M.logTs('called');
            return triggerBuf.do(a => M.logTs(`TriggerY: ${a ? 'Yes' : 'No'}`));
        })
        .flatMap(a => a)
        .subscribe(buffer);

    src.subscribe(source);
    pauser.subscribe(pauserSrc);

    Rx.Observable.merge(source.map(a => `S: ${a}`), buffer.map(a => `B: ${a}`))
    .do(a => M.logTs(`X - ${a}`))
    .subscribe(() => {}, () => {}, () => {
        Rx.Observable.interval(200).take(1).subscribe(() => pausable.complete());
    });

    pauserSrc
        .do(paused => M.logTs(`Paused: ${paused ? 'Yes' : 'No'}`))
        .distinctUntilChanged()
        .do(paused => M.logTs(`Paused2: ${paused ? 'Yes' : 'No'}`))
        .switchMap(paused => paused ? buffer.map(a => ['B', a]) : source.map(a => ['S', a]))
        .do(a => M.logTs(a))
        .map(a => a[1] as T)
        .subscribe(pausable);

    pauserSrc.next(true);  // start paused.

    return pausable;
}
