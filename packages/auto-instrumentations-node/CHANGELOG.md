# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.7](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.3.6...@cisco-telescope/auto-instrumentations-node@2.3.7) (2022-07-21)


### Bug Fixes

* **http.request.body:** add request.body to server span ([f9863ef](https://github.com/cisco-open/otel-js/commit/f9863ef31e816fb764d3be66a62cbbfad1c5a9b3))
* **http.request.body:** lint ([ca84a7e](https://github.com/cisco-open/otel-js/commit/ca84a7e51f5b02af119016a1d776f068ea24138c))
* **request.body:** add http.request.body to client span ([8c8546a](https://github.com/cisco-open/otel-js/commit/8c8546a33961d74ea7d2b29a01ede4828245f4ae))
* **request.body:** add http.request.body to client span ([17e4800](https://github.com/cisco-open/otel-js/commit/17e48007b9139ffdeb6ffac9bf7dd2eedee34fb8))





## [2.3.6](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.3.5...@cisco-telescope/auto-instrumentations-node@2.3.6) (2022-07-17)

### Bug Fixes

- **write function:** handle the case of calling twice to write ([b9ee921](https://github.com/cisco-open/otel-js/commit/b9ee9219ff9ff4a9f9ab2bccf3a95df7510b494a))

## [2.3.5](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.3.4...@cisco-telescope/auto-instrumentations-node@2.3.5) (2022-07-14)

### Bug Fixes

- **http.body:** lint ([0566f00](https://github.com/cisco-open/otel-js/commit/0566f00d6c1bc50b8846167c2ab7e266d853d759))

## [2.3.4](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.3.3...@cisco-telescope/auto-instrumentations-node@2.3.4) (2022-07-14)

### Bug Fixes

- **http.body:** add support for res.write(body) ([1b6628a](https://github.com/cisco-open/otel-js/commit/1b6628ada21bde54bed475c5d6bda19f7bcfcae9))

## [2.3.3](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.3.2...@cisco-telescope/auto-instrumentations-node@2.3.3) (2022-07-14)

### Bug Fixes

- **release:** removed lock files ([afc0bef](https://github.com/cisco-open/otel-js/commit/afc0befe8f0088312d4c87210641e583baca7e58))
- **release:** test commit ([8383ead](https://github.com/cisco-open/otel-js/commit/8383ead8359dba3fa6bca33f520a1f5572f1170e))
- **test-branch:** test commit ([a71f30d](https://github.com/cisco-open/otel-js/commit/a71f30d8e864bec93a08692e0fab4f53f666f23a))

## [2.3.2](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.3.1...@cisco-telescope/auto-instrumentations-node@2.3.2) (2022-07-12)

### Bug Fixes

- **http.body:** a first working solution with prependOnceListener ([28d6a8b](https://github.com/cisco-open/otel-js/commit/28d6a8b4784abeb809c32a788ce2e1e57f11321a))
- **http.body:** a first working solution with prependOnceListener ([baf18b2](https://github.com/cisco-open/otel-js/commit/baf18b2998c4ecf8663feb023011efe90d35694c))
- **http.body:** fix package-lock conflict ([d3ce77f](https://github.com/cisco-open/otel-js/commit/d3ce77f6569a747c740c1170b56bbef434dee3d0))
- **http.body:** fix README conflict ([a8ef8c1](https://github.com/cisco-open/otel-js/commit/a8ef8c1064fa3d56195b9b01b1513a0fbace0b7a))
- **http.body:** fix README conflict ([7ca79f5](https://github.com/cisco-open/otel-js/commit/7ca79f535b289f060cdd18e6736ddd9a37fc8f89))
- **http.body:** remove http local files for testing ([c55154a](https://github.com/cisco-open/otel-js/commit/c55154a89790bf6067aaa89a895be91a0d2b5d18))
- **http.body:** remove request and response Functions ([e7612da](https://github.com/cisco-open/otel-js/commit/e7612daaf4ecfc2360c1e7f02dd806516fcec3d0))
- **http.body:** remove request and response Functions - lint ([44bcdc9](https://github.com/cisco-open/otel-js/commit/44bcdc982d13125cb2725e1fbacc93acfba1420c))
- **http.body:** remove request and response Functions - lint ([c7d3b2c](https://github.com/cisco-open/otel-js/commit/c7d3b2c838850d979af3ffea5e975cf7e24c3b4f))
- **http.body:** remove request and response Functions - lint ([68b2a2d](https://github.com/cisco-open/otel-js/commit/68b2a2de659e3a3dc0acf01df51299906b2f2c0a))
- **http.body:** remove xdescribe from http test ([7f55177](https://github.com/cisco-open/otel-js/commit/7f551774d9c19fc0e1f225beb7cee95f715125e8))
- **http.body:** try to solve http.boty for serverResponse ([02a15fd](https://github.com/cisco-open/otel-js/commit/02a15fdd1eaac0ed8e3a511752c28854e72b06a1))
- **http.body:** try to solve http.boty in the server side for serverResponse ([d94c103](https://github.com/cisco-open/otel-js/commit/d94c103c76bb20d6663213dea20febb1121bbed3))

## [2.3.1](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.3.0...@cisco-telescope/auto-instrumentations-node@2.3.1) (2022-07-11)

### Bug Fixes

- **logger:** added default info logger to console ([2f960b3](https://github.com/cisco-open/otel-js/commit/2f960b3b6dc71c18b084088cc5721125ab776594))

# [2.3.0](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.2.4...@cisco-telescope/auto-instrumentations-node@2.3.0) (2022-07-10)

### Features

- **docs:** added auto instrumentations node README ([54df4bd](https://github.com/cisco-open/otel-js/commit/54df4bd976e1ad5c937eed0b0f902682146977cb))
- **docs:** removed debug option from auto-ints package ([741cb85](https://github.com/cisco-open/otel-js/commit/741cb858cb5457311b7150d04f1f90b6abde5739))
- **README:** fixed codecov to generate always reports ([15a7f68](https://github.com/cisco-open/otel-js/commit/15a7f68a909983f625d85b3b276e63816319e982))

## [2.2.4](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.2.3...@cisco-telescope/auto-instrumentations-node@2.2.4) (2022-07-07)

### Bug Fixes

- **test-release:** updated .gitignore ([785c846](https://github.com/cisco-open/otel-js/commit/785c8465be5c1094736c5e360ba023a63d1b37ee))

## [2.2.3](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.2.2...@cisco-telescope/auto-instrumentations-node@2.2.3) (2022-07-07)

### Bug Fixes

- **test-release:** test commit ([683cf09](https://github.com/cisco-open/otel-js/commit/683cf09487ed3b6e6208552d3b29daedd76d3c2d))

## [2.2.2](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.1.0...@cisco-telescope/auto-instrumentations-node@2.2.2) (2022-07-07)

### Bug Fixes

- **codecov:** trying add lerna run codecov ([fd339fa](https://github.com/cisco-open/otel-js/commit/fd339faf232b4e7dbcf1cbb923f3bb3e63c227cb))
- **release:** update release.yaml ([9af24c2](https://github.com/cisco-open/otel-js/commit/9af24c2b1a5448bf96f66254fadc58461c6d30b7))
- **test-release:** test commit ([b8c01b0](https://github.com/cisco-open/otel-js/commit/b8c01b0e0b4fb8e54828b25192f93beb5054a661))
- **test-release:** updated version in package.json ([69098f8](https://github.com/cisco-open/otel-js/commit/69098f88f3fa7b448dd7a1e0f1584c62e4871e96))

# [2.1.0](https://github.com/cisco-open/otel-js/compare/@cisco-telescope/auto-instrumentations-node@2.0.2...@cisco-telescope/auto-instrumentations-node@2.1.0) (2022-07-07)

### Bug Fixes

- **publish:** updated release.yaml ([c9b0086](https://github.com/cisco-open/otel-js/commit/c9b00869888847091d283ce45e1d555dfb21445c))

### Features

- **logs:** added some readable deabug logs ([97a073f](https://github.com/cisco-open/otel-js/commit/97a073ffc05031fe7684e53b4c797ea91b81ddf8))

# [2.1.0](https://github.com/epsagon/otel-js/compare/@cisco-telescope/auto-instrumentations-node@0.1.1...@cisco-telescope/auto-instrumentations-node@2.1.0) (2022-07-04)

### Features

- **lerna:** alinging packages versions ([d979024](https://github.com/epsagon/otel-js/commit/d9790244f1f928364eaf3811cd670f4bbf41dce6))
- **subpackages:** added option tests ([5bbfad3](https://github.com/epsagon/otel-js/commit/5bbfad3fef9e6ca4c1ea54fd0badc1ff07b4d83e))
- **subpackages:** added option tests ([efa0806](https://github.com/epsagon/otel-js/commit/efa0806298d1129867fb6f815ff9bc34863fddaa))
- **subpackages:** added option tests ([b5e387d](https://github.com/epsagon/otel-js/commit/b5e387de00e623a6764d9ba016e94f3ca8d20039))
- **subpackages:** added option tests ([fb08daa](https://github.com/epsagon/otel-js/commit/fb08daa04956bfaab9a20167fce12087f8fcf562))
- **subpackages:** updated getCiscoAutoInstrumentations API ([9f50dd8](https://github.com/epsagon/otel-js/commit/9f50dd84ae57de18b294009ca53bd50f91c57c6b))

# 0.1.0 (2022-07-03)

### Features

- **subpackages:** added lerna bootstrap ([dda61af](https://github.com/epsagon/otel-js/commit/dda61afed25521298ae5f8ad3f7397047a49e506))
- **subpackages:** added lerna bootstrap ([353380a](https://github.com/epsagon/otel-js/commit/353380ac41bbdfcccf143ca0d123206a1e616438))
- **subpackages:** fixed cicd ([c930291](https://github.com/epsagon/otel-js/commit/c930291c6d9d6bc6451913a1120f7f6c35715ee5))
- **subpackages:** fixed cicd ([306b5dc](https://github.com/epsagon/otel-js/commit/306b5dc6a60ed3538185e107680a71d52075c17e))
- **subpackages:** fixed grpc tests ([314abf3](https://github.com/epsagon/otel-js/commit/314abf3ee2a7835ed22fbfa8ab8b67f74af3bd1f))
- **subpackages:** fixed parsing errors ([e43f5f1](https://github.com/epsagon/otel-js/commit/e43f5f19eefd764225529b5c5087252c00a0e416))
- **subpackages:** fixed prettier ([51f1b17](https://github.com/epsagon/otel-js/commit/51f1b1759735557d28dab8b8725a5159e2d55cde))
- **subpackages:** fixing publish ([0f512ec](https://github.com/epsagon/otel-js/commit/0f512ec9ff57a278856b66ee3076d2df6d92a246))
- **subpackages:** removed system tests for now ([de423ea](https://github.com/epsagon/otel-js/commit/de423ea18505f3318f5521de11904e1e15967743))
- **subpackages:** removed system tests for now ([bf1f15e](https://github.com/epsagon/otel-js/commit/bf1f15e9b26362c5b6ebf395f29cbda8d23f0337))
- **subpackages:** removed system tests for now ([4316c76](https://github.com/epsagon/otel-js/commit/4316c76fe848d16a94255612ab15bb29c01e1813))
- **subpackages:** removed system tests for now ([b69d6d5](https://github.com/epsagon/otel-js/commit/b69d6d5956bf6b6e4d3c2ffe8d5c703746495cf9))
- **subpackages:** remvoed lock from the repo ([1be8439](https://github.com/epsagon/otel-js/commit/1be84399bf52685efb9329731c9d9c889870c542))
- **subpackages:** started working on subpackag ([2bee53b](https://github.com/epsagon/otel-js/commit/2bee53b4b38c41b65197cafe31c9a4ef03c4b6bd))
- **subpackages:** started working on subpackag ([303cc87](https://github.com/epsagon/otel-js/commit/303cc87005d9741d2bcdb01904429f4a64020ab1))
- **subpackages:** started working on subpackag ([22eaa4f](https://github.com/epsagon/otel-js/commit/22eaa4f920a157b385dc1164e4a9ce50d730ce0d))
- **subpackages:** updated eslint headers ([d1cf0e4](https://github.com/epsagon/otel-js/commit/d1cf0e435c0bcd19321a4aedb71c0cc7f910fdd1))
- **subpackages:** updated test imports ([ee8734d](https://github.com/epsagon/otel-js/commit/ee8734de3cf47b53b4de0080662f3e97c9569eab))
- **subpackages:** updated test imports ([65bf0d6](https://github.com/epsagon/otel-js/commit/65bf0d671a1e8cc4dfa1fce0929a2244c82056a7))
- **subpackages:** updated test imports ([cad8071](https://github.com/epsagon/otel-js/commit/cad8071a181fcbceaca51674b74bd3448a350cf3))
