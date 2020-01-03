import {Observable, Subscription} from 'rxjs';
import {map, distinctUntilChanged} from 'rxjs/operators';

export function streamToRx<T = Buffer>(
    stream: NodeJS.ReadableStream, 
    pauser?: Observable<boolean>
): Observable<T> {
    return new Observable<T>(subscriber => {
        const endHandler = () => subscriber.complete();
        const errorHandler = (e: Error) => subscriber.error(e);
        const dataHandler = (data: T) => subscriber.next(data);
        let pauseSubscription: Subscription;

        stream.addListener('end', endHandler);
        stream.addListener('close', endHandler);
        stream.addListener('error', errorHandler);
        stream.addListener('data', dataHandler);

        if (pauser) {
            pauseSubscription = pauser.pipe(
                distinctUntilChanged()
            ).subscribe(function(b) {
                if (b === false) {
                    stream.resume();
                } else if (b === true) {
                    stream.pause();
                }
            });
        }

        return () => {
            stream.removeListener('end', endHandler);
            stream.removeListener('close', endHandler);
            stream.removeListener('error', errorHandler);
            stream.removeListener('data', dataHandler);

            if (pauser) {
                pauseSubscription.unsubscribe();
            }
        };
    });
}

export function streamToStringRx(stream: NodeJS.ReadableStream, encoding?: string, pauser?: Observable<boolean>): Observable<string>;
export function streamToStringRx(stream: NodeJS.ReadableStream, encoding: BufferEncoding, pauser?: Observable<boolean>): Observable<string>;
export function streamToStringRx(stream: NodeJS.ReadableStream, encoding: string = 'utf8', pauser?: Observable<boolean>): Observable<string> {
    return streamToRx(stream, pauser)
        .pipe(map(buffer => buffer.toString(encoding)));
}
