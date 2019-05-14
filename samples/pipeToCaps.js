// See: [Cannot use stdin & stdout together · Issue #6](https://github.com/Jason3S/rx-stream/issues/6)

const { map } = require('rxjs/operators');
// const { rxToStream, streamToStringRx } = require('rxjs-stream');
const { rxToStream, streamToStringRx } = require('../dist/index');

const ob = streamToStringRx(process.stdin)
.pipe(
    map(l => l.toUpperCase()),
);

rxToStream(ob).pipe(process.stdout);
