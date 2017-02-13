import * as Rx from 'rxjs/Rx';
import * as stream from 'stream';

/**
 * Transform the output of an Observable into a node readable stream.
 */
export function rxToStream<T>(src: Rx.Observable<T>, encoding = 'utf8'): stream.Readable {

    const trigger = new Rx.Subject<void>();

    const readable = new stream.Readable({
        read: () => {
            trigger.next();
        },
    });

    trigger
        // Use zip to buffer the Observable so we only send when the stream is ready.
        .zip(src, (_, src) => src)
        .subscribe(
            // send the data and signal we can use more data.
            data => readable.push(data, encoding) ? trigger.next() : null,
            // Close on error or complete.
            () => readable.push(null),
            () => readable.push(null)
        );

    return readable;
}


