import * as Rx from 'rxjs/Rx';
import * as stream from 'stream';

export type Streamable = string | Buffer;

/**
 * Transform the output of an Observable into a node readable stream.
 */
export function rxToStream<T extends Streamable>(src: Rx.Observable<T>, options: stream.ReadableOptions = { encoding: 'utf8' }): stream.Readable {

    const trigger = new Rx.Subject<void>();
    let depth = 0;
    const maxDepth = 100;

    const readable = new stream.Readable({
        ...options,
        read: () => {
            trigger.next();
        },
    });

    function close() {
        Rx.Observable.interval(1).take(1).subscribe(
            () => readable.push(null)
        );
    }

    function next() {
        if (depth < maxDepth) {
            // Use the fastest method
            trigger.next();
        } else {
            // Slower to avoid running out of stack space.
            Rx.Observable.interval().take(1).subscribe(
                () => trigger.next()
            );
        }
    }

    function push(data: T) {
        depth += 1;
        readable.push(data) ? next() : null;
        depth -= 1;
    }

    trigger
        // Use zip to buffer the Observable so we only send when the stream is ready.
        .zip(src, (_, src) => src)
        .subscribe(
            // send the data and signal we can use more data.
            push,
            // Close on error or complete.
            close,
            close
        );

    return readable;
}


