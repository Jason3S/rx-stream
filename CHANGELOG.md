# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0] (https://github.com/Jason3S/rx-stream/compare/v3.3.0...v4.0.0) (2021-12-08)

* Move to RxJs 7

## [3.3.0](https://github.com/Jason3S/rx-stream/compare/v3.2.1...v3.3.0) (2021-07-18)


### Bug Fixes

* Add option to subscribe immediately to an observable. ([#109](https://github.com/Jason3S/rx-stream/issues/109)) ([81fcec5](https://github.com/Jason3S/rx-stream/commit/81fcec5462849246290e00d77796642781bb3156)), closes [#106](https://github.com/Jason3S/rx-stream/issues/106)

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
