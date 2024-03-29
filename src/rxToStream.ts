import { Observable, Subscription } from 'rxjs';
import * as stream from 'stream';

export type Streamable = string | Buffer;

export interface ReadableObservableStreamOptions extends stream.ReadableOptions {
    /**
     * Determines when to subscribe to the observable.
     * true - delay the subscription until the first read
     * false - subscribe immediately and buffer any data until the first read.
     * @default true
     */
    lazy?: boolean;
}

export interface ObjectReadableOptions extends ReadableObservableStreamOptions {
    objectMode: true;
}

/**
 * Transform the output of an Observable into a node readable stream.
 */
export function rxToStream<T>(src: Observable<T>, options: ObjectReadableOptions, onError?: (error: Error, readable: stream.Readable) => void): stream.Readable;
export function rxToStream<T extends Streamable>(
    src: Observable<T>,
    options?: ReadableObservableStreamOptions,
    onError?: (error: Error, readable: stream.Readable) => void
): stream.Readable;
export function rxToStream<T extends Streamable>(
    src: Observable<T>,
    options: ReadableObservableStreamOptions = { encoding: 'utf8' },
    onError?: (error: Error, readable: stream.Readable) => void
): stream.Readable {
    return new ReadableObservableStream(options, src, onError);
}

class ReadableObservableStream<T> extends stream.Readable {
    private _isOpen = false;
    private _hasError = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _error: any;
    private _waiting = false;
    private _subscription: Subscription;
    private _buffer: T[] = [];

    private emitError() {
        this.emit('error', this._error);
        if (this._onError) {
            this._onError(this._error, this);
        }
    }

    constructor(
        options: ReadableObservableStreamOptions,
        private _source: Observable<T>,
        private _onError: ((error: Error, readable: stream.Readable) => void) | undefined
    ) {
        super(streamOptions(options));
        if (options.lazy === false) {
            this.subscribeIfNecessary();
        }
    }

    _destroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

    _read() {
        const { _buffer } = this;

        this.subscribeIfNecessary();

        if (_buffer.length > 0) {
            while (_buffer.length > 0) {
                this._waiting = this.push(_buffer.shift());
                if (!this._waiting) break;
            }
        } else {
            if (this._isOpen) {
                this._waiting = true;
            } else {
                if (this._hasError) {
                    this.emitError();
                } else {
                    this.push(null);
                }
            }
        }
    }

    private subscribeIfNecessary() {
        if (this._subscription) return;

        const { _buffer } = this;
        this._isOpen = true;
        this._waiting = true;
        this._subscription = this._source.subscribe({
            next: (value) => {
                if (this._waiting) {
                    this._waiting = this.push(value);
                } else {
                    _buffer.push(value);
                }
            },
            error: (err) => {
                this._isOpen = false;
                this._hasError = true;
                this._error = err;
                if (this._waiting) {
                    this.emitError();
                }
            },
            complete: () => {
                this._isOpen = false;
                if (this._waiting) {
                    this.push(null);
                }
            },
        });
    }
}

function streamOptions(options: ReadableObservableStreamOptions): stream.ReadableOptions {
    const { lazy: _, ...streamOptions } = options;
    return streamOptions;
}
