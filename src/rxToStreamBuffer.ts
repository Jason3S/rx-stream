import * as Rx from 'rxjs/Rx';
import * as stream from 'stream';
import {ReadableStreamBuffer} from 'stream-buffers';


/**
 * Transform the output of an Observable into a node readable stream.
 */
export function rxToStreamBuffer<T>(src: Rx.Observable<T>, encoding = 'utf8'): stream.Readable {

    const stream = new ReadableStreamBuffer();

    src.subscribe(
        (data) => stream.push(data, encoding),
        () => {},
        () => stream.stop()
    );

    return stream;
}



