# rxjs-stream

This is a simple library for converting to and from NodeJS stream and rxjs 6.

This was created to fill the gap left by [rx-node](https://www.npmjs.com/package/rx-node),
which only works with rxjs 4.

## Installation

```sh
npm install --save rxjs-stream
```

## Usage

### Writing to a stream.

```typescript
import {rxToStream} from 'rxjs-stream';

let data = 'This is a bit of text to have some fun with';
let src = Rx.Observable.from(data.split(' '));
rxToStream(src).pipe(process.stdout);
```

### Read from a stream

```typescript
import {streamToStringRx} from 'rxjs-stream';

// Read stdin and make it upper case then send it to stdout
let ob = streamToStringRx(process.stdin)
    .map(text => text.toUpperCase());

rxToStream(ob).pipe(process.stdout);
```

## Performance

It is recommended to buffer observable values before sending them to the stream.
Node streams work better with fewer calls of a large amount of data than with many
calls with a small amount of data.

Example:

```typescript
import * as loremIpsum from 'lorem-ipsum';
import {rxToStream} from 'rxjs-stream';

let book = loremIpsum({ count: 1000, format: 'plain', units: 'paragraphs'});
let words = Rx.Observable.from(book.split(/\b/));
let wordsBuffered = words.bufferCount(1000).map(words => words.join(''));
let stream = rxToStream(wordsBuffered);

stream.pipe(process.stdout);
```
