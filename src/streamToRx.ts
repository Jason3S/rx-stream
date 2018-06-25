import {Observable} from 'rxjs';
import {map} from 'rxjs/operators'

export function streamToRx(stream: NodeJS.ReadableStream): Observable<Buffer> {
    return new Observable<Buffer>(subscriber => {
        const endHandler = () => subscriber.complete();
        const errorHandler = (e: Error) => subscriber.error(e);
        const dataHandler = (data: Buffer) => subscriber.next(data);

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
