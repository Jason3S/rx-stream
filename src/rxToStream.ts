import {Observable, Subscription} from 'rxjs';
import * as stream from 'stream';

export type Streamable = string | Buffer;

/**
 * Transform the output of an Observable into a node readable stream.
 */
export function rxToStream<T extends Streamable>(
    src: Observable<T>,
    options: stream.ReadableOptions = { encoding: 'utf8' },
    onError?: (error: Error, readable: stream.Readable) => void
): stream.Readable {
    return new ReadableObservableStream(options, src, onError);
}

class ReadableObservableStream<T> extends stream.Readable {
    constructor(
        options: stream.ReadableOptions,
        private _source: Observable<T>,
        private _onError: ((error: Error, readable: stream.Readable) => void) | undefined,
    ) {
        super(options);
    }

    private _isOpen = false;
      private _hasError = false;
    private _error: any;
    private _waiting = 0;
    private _subscription: Subscription;
    private _buffer: T[] = [];

    _read() {
        const { _buffer } = this;

        if (!this._subscription) {
            this._subscription = this._source.subscribe({
                next: value => {
                    if (this._waiting > 0) {
                        while (this._waiting > 0) {
                            this._waiting--;
                            const result = this.push(value);
                            if (!result) break;
                        }
                    } else {
                        _buffer.push(value);
                    }
                },
                error: (err) => {
                    this._isOpen = false;
                    this._hasError = true;
                    this._error = err;
                },
                complete: () => {
                    this._isOpen = false;
                },
            });
        }

        if (_buffer.length > 0) {
            while (_buffer.length > 0) {
                const result = this.push(_buffer.shift());
                if (!result) break;
            }
        } else {
            if (this._isOpen) {
                this._waiting++;
            } else {
                if (this._hasError) {
                    this.emit('error', this._error);
                    if (this._onError) {
                        this._onError(this._error, this);
                    }
                } else {
                    this.push(null);
                }
            }
        }
    }
}
