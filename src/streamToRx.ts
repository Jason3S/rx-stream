import {Subject, Observable} from 'rxjs';

export function streamToRx(stream: NodeJS.ReadableStream): Subject<Buffer> {
    const subject = new Subject<Buffer>();
    stream.on('end', () => subject.complete());
    stream.on('error', (e: Error) => subject.error(e));
    stream.on('data', (data: Buffer) => subject.next(data));
    return subject;
}

export function streamToStringRx(stream: NodeJS.ReadableStream, encoding: string = 'UTF-8'): Observable<string> {
    return streamToRx(stream)
        .map(buffer => buffer.toString(encoding));
}
