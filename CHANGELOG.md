# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.0.0](https://github.com/Jason3S/rx-stream/compare/v4.0.2...v5.0.0) (2022-06-07)


### ⚠ BREAKING CHANGES

* Drop support for Node 12

Note: The code has not changed, but the cost of maintaining the tools is too high.

### Features

* Drop support for Node 12 ([#349](https://github.com/Jason3S/rx-stream/issues/349)) ([db331d6](https://github.com/Jason3S/rx-stream/commit/db331d6ba238d971964693857242d6f1b52f1fe2))


### Bug Fixes

* Update `devDependencies` ([#258](https://github.com/Jason3S/rx-stream/issues/258)) ([df64568](https://github.com/Jason3S/rx-stream/commit/df64568f726efdf68a927c2dc1a2c4cfb3d476e3))
* Update dependencies and workflows ([#348](https://github.com/Jason3S/rx-stream/issues/348)) ([3d54289](https://github.com/Jason3S/rx-stream/commit/3d54289a27b2722a28dce15b1bfc21cd78682c4c))
* Update dev dependencies ([#304](https://github.com/Jason3S/rx-stream/issues/304)) ([6b6a404](https://github.com/Jason3S/rx-stream/commit/6b6a404504ad906d65e6947c5adc975312adffd5))
* upgrade rxjs from 7.5.4 to 7.5.5 ([#291](https://github.com/Jason3S/rx-stream/issues/291)) ([4e89239](https://github.com/Jason3S/rx-stream/commit/4e8923973a298036bbfee0a28642903d5939d900))

### [4.0.2](https://github.com/Jason3S/rx-stream/compare/v4.0.1...v4.0.2) (2021-12-13)

### [4.0.1](https://github.com/Jason3S/rx-stream/compare/v3.3.0...v4.0.1) (2021-12-13)

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
