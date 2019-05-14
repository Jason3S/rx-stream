import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export function streamToRx<T = Buffer>(stream: NodeJS.ReadableStream): Observable<T> {
    return new Observable<T>(subscriber => {
        const endHandler = () => subscriber.complete();
        const errorHandler = (e: Error) => subscriber.error(e);
        const dataHandler = (data: T) => subscriber.next(data);

        stream.addListener('end', endHandler);
        stream.addListener('error', errorHandler);
        stream.addListener('data', dataHandler);

        return () => {
            stream.removeListener('end', endHandler);
            stream.removeListener('error', errorHandler);
            stream.removeListener('data', dataHandler);
        };
    });
}

export function streamToStringRx(stream: NodeJS.ReadableStream, encoding: string = 'UTF-8'): Observable<string> {
    return streamToRx(stream)
        .pipe(map(buffer => buffer.toString(encoding)));
}
