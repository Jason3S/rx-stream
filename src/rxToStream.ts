import * as Rx from 'rxjs/Rx';
import * as stream from 'stream';

export function rxToStream<T>(src: Rx.Observable<T>, encoding = 'utf8'): stream.Readable {
    const onReadRequest = new Rx.Subject<void>();
    const bufferedSrc = src.bufferWhen(() => onReadRequest);
    const readable = new stream.Readable({
        read: () => { onReadRequest.next(); },
    });

    bufferedSrc.subscribe(
        data => data.forEach(data => readable.push(data, encoding))
    );

    return readable;
}
