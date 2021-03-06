# Changelog

## [3.2.0]
* Support Object streams [How do we create an Object stream from Observable? · Issue #17](https://github.com/Jason3S/rx-stream/issues/17)

## [3.1.1]
* Address [Back Pressure support · Issue #13](https://github.com/Jason3S/rx-stream/issues/13)

## [3.1.0]
* Fix [stream never unsubscribes from the source observable when destroyed · Issue #12](https://github.com/Jason3S/rx-stream/issues/12)

## [3.0.1]
* Added a unit test that reads / writes to a file. I was investigating when rx-stream broke with rxjs 6.3. In the end, it was due to an issue with rxjs.
  See: [rxjs #4071](https://github.com/ReactiveX/rxjs/issues/4071), [rxjs #4072](https://github.com/ReactiveX/rxjs/issues/4072), [rxjs #4073](https://github.com/ReactiveX/rxjs/issues/4073)

## [3.0.0]
* Breaking change: [streamToRx - now returns Observable](https://github.com/Jason3S/rx-stream/pull/3)
* [refactor(rxToStream): removes recursion, reduces overall size of impl… #4](https://github.com/Jason3S/rx-stream/pull/4)

## [2.0.0]
* Move to RxJs 6

## [1.3.0]
* Move to RxJs 5.5
