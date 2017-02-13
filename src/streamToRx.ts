import * as Rx from 'rxjs/Rx';

export function streamToRx(stream: NodeJS.ReadableStream): Rx.Subject<Buffer> {
    const subject = new Rx.Subject<Buffer>();
    stream.on('end', () => subject.complete());
    stream.on('error', (e: Error) => subject.error(e));
    stream.on('data', (data: Buffer) => subject.next(data));
    return subject;
}

export function streamToStringRx(stream: NodeJS.ReadableStream, encoding: string = 'UTF-8'): Rx.Observable<string> {
    return streamToRx(stream)
        .map(buffer => buffer.toString(encoding));
}

