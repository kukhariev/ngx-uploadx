# [3.5.2](https://github.com/kukhariev/ngx-uploadx/compare/v3.5.1...v3.5.2) (2020-09-20)

_Undo breaking changes introduced in 3.5.1_

### Reverts

- Revert "refactor: (#247)" ([15844ad](https://github.com/kukhariev/ngx-uploadx/commit/15844ada8e8fecffd590f008d0d61a1e9e741225))

## [3.5.1](https://github.com/kukhariev/ngx-uploadx/compare/v3.5.0...v3.5.1) (2020-07-20)

# [3.5.0](https://github.com/kukhariev/ngx-uploadx/compare/v3.4.0...v3.5.0) (2020-07-16)

### Bug Fixes

- missing errors logging ([#244](https://github.com/kukhariev/ngx-uploadx/issues/244)) ([a902dfc](https://github.com/kukhariev/ngx-uploadx/commit/a902dfcc19b06e745a1577caf66de7fe4c98330c)), closes [#243](https://github.com/kukhariev/ngx-uploadx/issues/243) [#242](https://github.com/kukhariev/ngx-uploadx/issues/242)
- ts 2.x unknown type error ([0220e94](https://github.com/kukhariev/ngx-uploadx/commit/0220e944df7a37d3e5f102c5e8566e60539fd800))

### Features

- prerequest option ([#246](https://github.com/kukhariev/ngx-uploadx/issues/246)) ([0b47315](https://github.com/kukhariev/ngx-uploadx/commit/0b47315bf60bf65e0666f9c3bc66249815c9c0ec))

# [3.4.0](https://github.com/kukhariev/ngx-uploadx/compare/v3.3.5...v3.4.0) (2020-07-02)

### Bug Fixes

- chunk type ([972c69c](https://github.com/kukhariev/ngx-uploadx/commit/972c69cf8d00d1458dec2c740a01325137c308ff))
- delete confusing error emulation code ([ad54996](https://github.com/kukhariev/ngx-uploadx/commit/ad54996f0dfd7012fa51d9da3dba77ba26319d40))
- prod environment ([08a5909](https://github.com/kukhariev/ngx-uploadx/commit/08a5909b36409cc4a1fbb7e1ae8f5c2c32288400))

### Features

- angular 10 support ([2b74dd3](https://github.com/kukhariev/ngx-uploadx/commit/2b74dd3bb88875af0faeec792217d18c49fe556f))

## [3.3.5](https://github.com/kukhariev/ngx-uploadx/compare/v3.3.4...v3.3.5) (2020-04-10)

### Bug Fixes

- less restrictive range header check([#180](https://github.com/kukhariev/ngx-uploadx/issues/180)) ([859cedb](https://github.com/kukhariev/ngx-uploadx/commit/859cedbb838b775bb1716130389531412a3202d5))
- **deps:** update dependency rxjs to v6.5.5 ([#177](https://github.com/kukhariev/ngx-uploadx/issues/177)) ([812099c](https://github.com/kukhariev/ngx-uploadx/commit/812099c3f989c71aa2a4d6b62eab3cb767183a43))
- **deps:** update dependency zone.js to v0.10.3 ([#164](https://github.com/kukhariev/ngx-uploadx/issues/164)) ([64a5eb3](https://github.com/kukhariev/ngx-uploadx/commit/64a5eb3571f3299319c0cfe4188d662d83aab46d))

## [3.3.4](https://github.com/kukhariev/ngx-uploadx/compare/v3.3.3...v3.3.4) (2020-03-03)

### Bug Fixes

- "events" in UploadService not called if item in queue is canceled ([#153](https://github.com/kukhariev/ngx-uploadx/issues/153)) ([0f529d2](https://github.com/kukhariev/ngx-uploadx/commit/0f529d24aad2eac8c1be442913ad1a76013133b0))
- handle file dnd events only ([#141](https://github.com/kukhariev/ngx-uploadx/issues/141)) ([86827ea](https://github.com/kukhariev/ngx-uploadx/commit/86827eaf77354729e5bd1581c906eecf6e083221))

## [3.3.3](https://github.com/kukhariev/ngx-uploadx/compare/v3.3.2...v3.3.3) (2020-01-11)

## [3.3.2](https://github.com/kukhariev/ngx-uploadx/compare/v3.3.1...v3.3.2) (2019-10-29)

### Bug Fixes

- mimeType ([e418e21](https://github.com/kukhariev/ngx-uploadx/commit/e418e213a3f4e60cb20c64dfbde553155bf9db04))
- stateChange on rejected onCancel ([6637139](https://github.com/kukhariev/ngx-uploadx/commit/663713946e2157500f47c8481b7d7a054827693c))

## [3.3.1](https://github.com/kukhariev/ngx-uploadx/compare/v3.3.0...v3.3.1) (2019-10-14)

### Bug Fixes

- onCancel event ([277317b](https://github.com/kukhariev/ngx-uploadx/commit/277317bd77ce61f5f177cf5d42ead32377b844e8))
- expose utils needed for extending ([f0dbc3a](https://github.com/kukhariev/ngx-uploadx/commit/f0dbc3ae1d91cec13ae2198905dad5e114780588))
- offset check ([4efd6c0](https://github.com/kukhariev/ngx-uploadx/commit/4efd6c0b72d8a8a0c1ae1378b8e50f2bd5579b69))
- single request upload if chunkSize is 0 ([7e4be00](https://github.com/kukhariev/ngx-uploadx/commit/7e4be00c8a3021469194527e6656ea970ad55734))

# [3.3.0](https://github.com/kukhariev/ngx-uploadx/compare/v3.2.2...v3.3.0) (2019-10-03)

### Bug Fixes

- avoid empty x headers ([d150f31](https://github.com/kukhariev/ngx-uploadx/commit/d150f312c0170e41ccfdc22c6107e07cc7dd71bb))
- implement OnDestroy ([5e2270e](https://github.com/kukhariev/ngx-uploadx/commit/5e2270e06afc653dc2a505b08e7a6b5708278be6))

### Features

- handle online/offline status ([30956e0](https://github.com/kukhariev/ngx-uploadx/commit/30956e066fe45a5acf755b42d2a8cf570cb1042b))

## [3.2.2](https://github.com/kukhariev/ngx-uploadx/compare/v3.2.1...v3.2.2) (2019-09-21)

### Bug Fixes

- resolve protocol-relative location URL ([0ed4c5a](https://github.com/kukhariev/ngx-uploadx/commit/0ed4c5a862677409c388abf033855251825af928)), closes [#59](https://github.com/kukhariev/ngx-uploadx/issues/59)

## [3.2.1](https://github.com/kukhariev/ngx-uploadx/compare/v3.2.0...v3.2.1) (2019-09-20)

### Bug Fixes

- catch `DELETE` http error ([a09b8d4](https://github.com/kukhariev/ngx-uploadx/commit/a09b8d43dc2e1854eb6e7b0fd6edb3469a67b46e))
- **utils:** safer isNumber ([e6dbb5a](https://github.com/kukhariev/ngx-uploadx/commit/e6dbb5a8e3879231e6d46d7ea598697eeb0f94c8))

# [3.2.0](https://github.com/kukhariev/ngx-uploadx/compare/v3.1.4...v3.2.0) (2019-09-12)

### Bug Fixes

- set uploaderClass from directives ([9a6400b](https://github.com/kukhariev/ngx-uploadx/commit/9a6400b0d9a9d77f8a15da77400a7eed2a4e019d))
- remaining on complete ([05ab714](https://github.com/kukhariev/ngx-uploadx/commit/05ab71437ff80a462cd9ae8f4ce6d9b39dfbfb0c))

### Features

- built-in tus protocol support ([ed8ec48](https://github.com/kukhariev/ngx-uploadx/commit/ed8ec48212d876aea499fb61e5caa58aa4d09207))
- store uploads meta in localStorage ([6aa3ed6](https://github.com/kukhariev/ngx-uploadx/commit/6aa3ed645c866eff5bee2a06a2850347a1dbda88))

## [3.1.4](https://github.com/kukhariev/ngx-uploadx/compare/v3.1.3...v3.1.4) (2019-09-02)

### Bug Fixes

- max - min chunk sizes ([ec2b11f](https://github.com/kukhariev/ngx-uploadx/commit/ec2b11fd5bc16e53ac86a9fcd22e0c10ce41fa86))
- remove CommonModule import ([710cf0d](https://github.com/kukhariev/ngx-uploadx/commit/710cf0da1115e9622fa4accd81c07c3aa623f3b8))

### Performance Improvements

- throttle redundant onprogress events ([dfd6f02](https://github.com/kukhariev/ngx-uploadx/commit/dfd6f02fb8432f97dc72ea6bd36d1548bc32c6ea))

## [3.1.3](https://github.com/kukhariev/ngx-uploadx/compare/v3.1.2...v3.1.3) (2019-07-25)

### Bug Fixes

- uploading file with zero size ([d5538c7](https://github.com/kukhariev/ngx-uploadx/commit/d5538c7df251c9e06743fd80f90263dc1386f8d4)), closes [#49](https://github.com/kukhariev/ngx-uploadx/issues/49)
- uploading file with zero size ([4b6c708](https://github.com/kukhariev/ngx-uploadx/commit/4b6c708192d555ae32f4851b207bc4444966e329)), closes [#49](https://github.com/kukhariev/ngx-uploadx/issues/49)

## [3.1.2](https://github.com/kukhariev/ngx-uploadx/compare/v3.1.1...v3.1.2) (2019-07-17)

### Bug Fixes

- restart on missing range ([c0b2744](https://github.com/kukhariev/ngx-uploadx/commit/c0b2744bfff9d3b5f3bfbfa4eb1cbe912d358094)), closes [#46](https://github.com/kukhariev/ngx-uploadx/issues/46)
- limit attempts to upload content ([b84b430](https://github.com/kukhariev/ngx-uploadx/commit/b84b430c45c97c05c59105e683accc319fdfebc1))
- range parser ([333d7fe](https://github.com/kukhariev/ngx-uploadx/commit/333d7fe73f18cefa92e55c368c175000f3ec8880)), closes [#46](https://github.com/kukhariev/ngx-uploadx/issues/46)
- reset offset retry ([7f20f23](https://github.com/kukhariev/ngx-uploadx/commit/7f20f2342b05b0fb2ef7375b905bc1f138ea0762))

## [3.1.1](https://github.com/kukhariev/ngx-uploadx/compare/v3.1.0...v3.1.1) (2019-07-04)

### Bug Fixes

- `getOffsetFromResponse` access modifier ([6f06171](https://github.com/kukhariev/ngx-uploadx/commit/6f061716484ae43ccb2c606291d802e96d240610))
- directive not set concurrency ([7f8beab](https://github.com/kukhariev/ngx-uploadx/commit/7f8beab9671726c52766cc12c8f83ff9963b3603))
- prevent from retrying indefinitely ([8bd654f](https://github.com/kukhariev/ngx-uploadx/commit/8bd654f670a89e50bd78fc3fc275fdfac0e94c30))

# [3.1.0](https://github.com/kukhariev/ngx-uploadx/compare/v3.0.0...v3.1.0) (2019-06-07)

### Bug Fixes

- broken `token` renew ([e13db2f](https://github.com/kukhariev/ngx-uploadx/commit/e13db2fd8ddcfb0f2037af5658c83d536fffdb73))

### Features

- аbility to change the authentication scheme ([a243ed3](https://github.com/kukhariev/ngx-uploadx/commit/a243ed353ce132cbab43a72b8395add282448ef3))

# [3.0.0](https://github.com/kukhariev/ngx-uploadx/compare/v2.8.3...v3.0.0) (2019-05-29)

### Bug Fixes

- extending internal uploaderx class ([496acff](https://github.com/kukhariev/ngx-uploadx/commit/496acfff0f003b7fd3b35c6b3aec01a9df8da538))
- set default endpoint ([fb28de3](https://github.com/kukhariev/ngx-uploadx/commit/fb28de31a7f503e0a6a3ea15dcf9369328a2d096))
- uploaderClass type ([12192f5](https://github.com/kukhariev/ngx-uploadx/commit/12192f5b2ab32d90cc7eeefd93c2fb3241ee6fbc))
- uploaderClass typings ([f612677](https://github.com/kukhariev/ngx-uploadx/commit/f6126776eca85e9927719c429c8bad502a45d8ed))

### Code Refactoring

- uploads control ([c89ad8c](https://github.com/kukhariev/ngx-uploadx/commit/c89ad8c590518ed760b559f8ede13e9064d8a41e))

### Features

- add 'multiple' attribute ([a384eae](https://github.com/kukhariev/ngx-uploadx/commit/a384eae4f237871ba30b121c47c7a0bb86cfc583))
- angular 8 support ([c4b9b9f](https://github.com/kukhariev/ngx-uploadx/commit/c4b9b9f3a5f95211fe5c8c3e1ea2299a5538d8b7))
- directive instance options ([9cb7665](https://github.com/kukhariev/ngx-uploadx/commit/9cb76653052fae9729870927aec3bc521d5299e3)), closes [#41](https://github.com/kukhariev/ngx-uploadx/issues/41)
- remove 'url' alias ([b0dacc5](https://github.com/kukhariev/ngx-uploadx/commit/b0dacc59ec6f05ce0a53c0c86d8d0cd87073c8e7))
- rename some props ([de03db4](https://github.com/kukhariev/ngx-uploadx/commit/de03db4ac0e63aa58a0185131c8356f03d9e5371))
- status codes that should not be retried ([196e191](https://github.com/kukhariev/ngx-uploadx/commit/196e191f09a96b634dddf78c2fa2e34809aa187a))
- uploadxDrop directive ([03f2480](https://github.com/kukhariev/ngx-uploadx/commit/03f2480b0f240c3fb5477b4dba7a88a88f3c3501))

### BREAKING CHANGES

- changed `UploadxControlEvent` interface
- rename 'URI' to 'url' and 'getFileURI' to 'getFileUrl'
- remove deprecated 'url' option

## [2.8.3](https://github.com/kukhariev/ngx-uploadx/compare/v2.8.2...v2.8.3) (2019-05-05)

### Bug Fixes

- token type ([6371502](https://github.com/kukhariev/ngx-uploadx/commit/637150219d05541d88d6b9ba7030b173cc6b2fcf))

## [2.8.2](https://github.com/kukhariev/ngx-uploadx/compare/v2.8.1...v2.8.2) (2019-04-30)

### Bug Fixes

- missing first authorization header ([b17f017](https://github.com/kukhariev/ngx-uploadx/commit/b17f0171b41d2e535afbefade773d3e9ac75fd95))

## [2.8.1](https://github.com/kukhariev/ngx-uploadx/compare/v2.8.0...v2.8.1) (2019-04-29)

### Bug Fixes

- async token getter ([d585125](https://github.com/kukhariev/ngx-uploadx/commit/d585125bcd8550f7945b6170635994a4462b8d82))
- token getter interface ([03f21a7](https://github.com/kukhariev/ngx-uploadx/commit/03f21a70c07c8794aceb1eca4d8f35034bf2a7ef))

### Performance Improvements

- ngzone bypass ([e563c75](https://github.com/kukhariev/ngx-uploadx/commit/e563c75cf3ada613f18c370b27de8d31a2d01e09))

# [2.8.0](https://github.com/kukhariev/ngx-uploadx/compare/v2.7.1...v2.8.0) (2019-04-27)

### Features

- adaptive chunk size ([409e14c](https://github.com/kukhariev/ngx-uploadx/commit/409e14c9a26eb5bd0e0b8991bb0f0c9af7f287f7))

## [2.7.1](https://github.com/kukhariev/ngx-uploadx/compare/v2.7.0...v2.7.1) (2019-04-22)

### Bug Fixes

- set chunk size value ([caf4ac4](https://github.com/kukhariev/ngx-uploadx/commit/caf4ac4028eddb9490e95525d841004a290bf77f))
- validate response header ([a007213](https://github.com/kukhariev/ngx-uploadx/commit/a007213715fdb0a156f235134342e3e4e9a06d52))

# [2.7.0](https://github.com/kukhariev/ngx-uploadx/compare/v2.6.3...v2.7.0) (2019-04-21)

### Bug Fixes

- increase min retry delay ([2f6650a](https://github.com/kukhariev/ngx-uploadx/commit/2f6650a435feee26fc2430b73406a18727b338ed))
- keep options ([88954ce](https://github.com/kukhariev/ngx-uploadx/commit/88954ce02e5e397b3e351bd5246e16c23511f2b3))
- keep options ([35449f4](https://github.com/kukhariev/ngx-uploadx/commit/35449f422559e63fbd8f433a766af45933c8424c))

### Features

- user defined upload classes ([52016aa](https://github.com/kukhariev/ngx-uploadx/commit/52016aab308583dea2094e99e3252022e6bfe486))

## [2.6.3](https://github.com/kukhariev/ngx-uploadx/compare/v2.6.2...v2.6.3) (2019-04-10)

### Bug Fixes

- init and connect should not reset the queue ([d31cede](https://github.com/kukhariev/ngx-uploadx/commit/d31cede89403b53acdc44ad74da62aa89b846916))

## [2.6.2](https://github.com/kukhariev/ngx-uploadx/compare/v2.6.1...v2.6.2) (2019-04-06)

## [2.6.1](https://github.com/kukhariev/ngx-uploadx/compare/v2.6.0...v2.6.1) (2019-04-04)

### Bug Fixes

- refreshToken on the fly ([c1b2314](https://github.com/kukhariev/ngx-uploadx/commit/c1b231411f56020314fd26a2541ab87bc744aae9)), closes [#28](https://github.com/kukhariev/ngx-uploadx/issues/28)

# [2.6.0](https://github.com/kukhariev/ngx-uploadx/compare/v2.5.1...v2.6.0) (2019-03-31)

### Bug Fixes

- allow empty body response ([e4b27e4](https://github.com/kukhariev/ngx-uploadx/commit/e4b27e4a02f3d83e9123d37ef50e6034ab0aebd6))
- mising lastModified metadata property ([2b33559](https://github.com/kukhariev/ngx-uploadx/commit/2b335591636a54841ce9ea7bba6efe5218d79aab))
- per file endpoint option ([c9b10fe](https://github.com/kukhariev/ngx-uploadx/commit/c9b10feadf809d0ac6357d83daf3549da6d4d301)), closes [#26](https://github.com/kukhariev/ngx-uploadx/issues/26)

### Features

- **service:** connect method ([76daaf7](https://github.com/kukhariev/ngx-uploadx/commit/76daaf7de220acc4badd7b40baada753292a7297))
- **service:** disconnect method ([7a16eef](https://github.com/kukhariev/ngx-uploadx/commit/7a16eefa0956d8e674d0b690d894ac76fbb99186))

## [2.5.1](https://github.com/kukhariev/ngx-uploadx/compare/v2.5.0...v2.5.1) (2019-03-12)

### Bug Fixes

- missing global metadata option ([d868e78](https://github.com/kukhariev/ngx-uploadx/commit/d868e786bec84f649429689654f934e1c84eaa59))

# [2.5.0](https://github.com/kukhariev/ngx-uploadx/compare/v2.4.6...v2.5.0) (2019-03-10)

### Bug Fixes

- xhr.abort on pause ([1fa8dd2](https://github.com/kukhariev/ngx-uploadx/commit/1fa8dd297b41d3ede1038a5924a6b3c24953b741))

### Features

- 4xx automated retries ([89bcb5e](https://github.com/kukhariev/ngx-uploadx/commit/89bcb5e75e20a96f1f9d998391f0ade6ce074acd)), closes [#17](https://github.com/kukhariev/ngx-uploadx/issues/17)
- new retry logic ([d66c3dd](https://github.com/kukhariev/ngx-uploadx/commit/d66c3dd3b7bf9fe1cf54c84b085ec420c470e46b))

## [2.4.6](https://github.com/kukhariev/ngx-uploadx/compare/v2.4.5...v2.4.6) (2019-03-06)

### Bug Fixes

- HttpRequests not aborted on pause and cancel ([7de869e](https://github.com/kukhariev/ngx-uploadx/commit/7de869e3b2f46a958ae912dba152b00457cbd1f1))
- HttpRequests not aborted on pause and cancel ([7c6e2b6](https://github.com/kukhariev/ngx-uploadx/commit/7c6e2b64257a098b570a43cbfdc06bcb70ace488))
- delete is not send to server on cancel ([583771f](https://github.com/kukhariev/ngx-uploadx/commit/583771f8d2e2be704ffb28ba10274a7c440f4242)), closes [#20](https://github.com/kukhariev/ngx-uploadx/issues/20)
- handle expired uploads ([6ee8c30](https://github.com/kukhariev/ngx-uploadx/commit/6ee8c308c4579f4cb45e6197467ea9f3f21861d8))

## [2.4.5](https://github.com/kukhariev/ngx-uploadx/compare/v2.4.0...v2.4.5) (2019-03-04)

### Bug Fixes

- 'upload' action ([37a2229](https://github.com/kukhariev/ngx-uploadx/commit/37a2229ad15737ae4b301c877be504619ae472df)), closes [#18](https://github.com/kukhariev/ngx-uploadx/issues/18)
- do not processQueue on progress events ([6f1693d](https://github.com/kukhariev/ngx-uploadx/commit/6f1693daf8a30bccbc1a2013b70a81b21753e399))
- kill request listeners on cancel ([25009ae](https://github.com/kukhariev/ngx-uploadx/commit/25009ae43bfba5569dd6053c3e560af4cf9be38e))
- send `delete` request on cancel ([d6899be](https://github.com/kukhariev/ngx-uploadx/commit/d6899beddd37807eb4eca0796d8827b4ea99b21d)), closes [#20](https://github.com/kukhariev/ngx-uploadx/issues/20)
- autoUpload default value ([ff5e58b](https://github.com/kukhariev/ngx-uploadx/commit/ff5e58bbdb192ca138ada3aa697724b5b5055359))
- make Uploader public ([0804e58](https://github.com/kukhariev/ngx-uploadx/commit/0804e58cbaa6a4e043eeb9803d9ac9440eb33c8e))
- reset queue on init ([e9cd7da](https://github.com/kukhariev/ngx-uploadx/commit/e9cd7da72ee3340f05b537767db6ff943c6eda58))
- **app:** missing error handler example ([e8b886f](https://github.com/kukhariev/ngx-uploadx/commit/e8b886fbb4ba7d49f8c87dda4c6e20178c466ab0))
- **app:** missing onPush example ([aa04673](https://github.com/kukhariev/ngx-uploadx/commit/aa0467371c5add471e4a8317584272ed6577c232))

### Features

- responseStatus ([d9a1bb8](https://github.com/kukhariev/ngx-uploadx/commit/d9a1bb87310c501a7a49cfc9b6d7a53ddce17cf4))

# [2.4.0](https://github.com/kukhariev/ngx-uploadx/compare/v2.3.4...v2.4.0) (2019-02-28)

### Bug Fixes

- **app:** sass deprecation warning ([135aa10](https://github.com/kukhariev/ngx-uploadx/commit/135aa103604914150fba24188d532ac52d75fbd5))
- add UploadStatus cast in the code ([58e9987](https://github.com/kukhariev/ngx-uploadx/commit/58e998786d3e404384e901b45ecd201ca5656534))
- avoid possible logic error with negative numbers in slice function ([6b6bb62](https://github.com/kukhariev/ngx-uploadx/commit/6b6bb629cd9239dea33c1f36d5e6f1672875a4a5))
- handlers files methods are not async any more ([5ed593e](https://github.com/kukhariev/ngx-uploadx/commit/5ed593e840c592db036864e9324d6542c252dfcb))
- unnecessary processQueue calls ([939764f](https://github.com/kukhariev/ngx-uploadx/commit/939764fdae4f70288e594c3f65222897707901d2))
- update autoUoloadFiles method to put as queue the added files ([301a2b5](https://github.com/kukhariev/ngx-uploadx/commit/301a2b5d485bb9a3f4332fd1ce9e34b2c8cdd132))
- upload more than the concurrent limit ([750ea5a](https://github.com/kukhariev/ngx-uploadx/commit/750ea5a4aca3de24ea309107ce87816cf5dc998b))
- use forEach instead map ([7bf8144](https://github.com/kukhariev/ngx-uploadx/commit/7bf81440b4a9caa6fec4a4018e22d82559ddd94f))

### Features

- start queue upload if some upload finish ([0fe11de](https://github.com/kukhariev/ngx-uploadx/commit/0fe11dede08116ad1da5f5d95f2d316027dda93e))

### Reverts

- fix put back the autoUpload variable to true ([ad73a51](https://github.com/kukhariev/ngx-uploadx/commit/ad73a51bb83a359144db65d4c7b803bac005df55))

## [2.3.4](https://github.com/kukhariev/ngx-uploadx/compare/v2.3.3...v2.3.4) (2019-02-24)

### Bug Fixes

- abort method ([275934a](https://github.com/kukhariev/ngx-uploadx/commit/275934a1c9f8923d08d493394fdcaf815df9ce6f)), closes [#10](https://github.com/kukhariev/ngx-uploadx/issues/10)
- freeze completed and canceled uploads ([c0cb66f](https://github.com/kukhariev/ngx-uploadx/commit/c0cb66ff2a86e1e55c04265fa080fa1eaa27149a))

## [2.3.3](https://github.com/kukhariev/ngx-uploadx/compare/v2.3.2...v2.3.3) (2019-02-24)

### Bug Fixes

- first chunk abort ([2bea469](https://github.com/kukhariev/ngx-uploadx/commit/2bea46995b9aa6f4e1d96029d1452dbbf50638bf))
- not fire event if status not changed ([04a94e3](https://github.com/kukhariev/ngx-uploadx/commit/04a94e3b06f8068c4a6e18a8b9f296bfc7891766))

## [2.3.2](https://github.com/kukhariev/ngx-uploadx/compare/v2.2.1...v2.3.2) (2019-02-24)

### Bug Fixes

- allow to upload images in the server ([701e651](https://github.com/kukhariev/ngx-uploadx/commit/701e65198dccdc92646948e11224bb98c95eae3f))
- don't delete completed uploads ([3aa88a2](https://github.com/kukhariev/ngx-uploadx/commit/3aa88a284f33abd0dae0b23d0a2d4303941f5de7))
- new example way tests ([ca2accb](https://github.com/kukhariev/ngx-uploadx/commit/ca2accb937674f917d63389da830f70314ba4884))
- refactoring all files dependencies with the angular specifications ([7e2f231](https://github.com/kukhariev/ngx-uploadx/commit/7e2f2315db4613802c62a22250f204a12bab6a7c))
- Remove package-lock.json file from version control ([b2068cb](https://github.com/kukhariev/ngx-uploadx/commit/b2068cbf929823a1b165f42e9c78cab7e6862c15))
- serviceCodeWay component tests ([c5437f9](https://github.com/kukhariev/ngx-uploadx/commit/c5437f937fe2b964fafc75e7931751085e53dd0b))
- stop using fileList as array for avoid test error ([89bc6cb](https://github.com/kukhariev/ngx-uploadx/commit/89bc6cbc555b5d4d9b130def04335bc8c4243228))

### Features

- Create new example to upload files by code and add handleFile method to the uploadx service ([94a2b8d](https://github.com/kukhariev/ngx-uploadx/commit/94a2b8d29bfbca310172212bc6ff6b3ac3911f05))

## [2.2.1](https://github.com/kukhariev/ngx-uploadx/compare/v2.2.0...v2.2.1) (2019-02-19)

### Bug Fixes

- abort method ([337b2a8](https://github.com/kukhariev/ngx-uploadx/commit/337b2a8fb6c9dda66ea8fe7e15045c46e42faf5f)), closes [#10](https://github.com/kukhariev/ngx-uploadx/issues/10)
- create session ([725263b](https://github.com/kukhariev/ngx-uploadx/commit/725263bbad01d3d0a340dc7372be39068df14dd8)), closes [#9](https://github.com/kukhariev/ngx-uploadx/issues/9)

# [2.2.0](https://github.com/kukhariev/ngx-uploadx/compare/v2.1.0...v2.2.0) (2019-02-18)

### Bug Fixes

- zero file size range ([f175c34](https://github.com/kukhariev/ngx-uploadx/commit/f175c34f834c10b7ff379143b586547ca0374607))

### Features

- allow keys in response ([5c640c2](https://github.com/kukhariev/ngx-uploadx/commit/5c640c22102c908593cdc286a43d3d54ce200d79))
- metadata getter ([4f857b1](https://github.com/kukhariev/ngx-uploadx/commit/4f857b1684d0c3c7aed52fd1b2e5c29e07d02052))
- parse IE response ([eb20990](https://github.com/kukhariev/ngx-uploadx/commit/eb20990938d3927983292fbfc0d72c615f9a9203))
- pass function as token, headers, metadata ([9614c05](https://github.com/kukhariev/ngx-uploadx/commit/9614c058cea7355eed0c1d1a16eeb82b6414af7f))

# [2.1.0](https://github.com/kukhariev/ngx-uploadx/compare/v2.0.2...v2.1.0) (2019-02-13)

### Bug Fixes

- reset error status ([ca2ebae](https://github.com/kukhariev/ngx-uploadx/commit/ca2ebaec34d85366d19fb0b827b11b631d46add7))

### Features

- token function ([87ec633](https://github.com/kukhariev/ngx-uploadx/commit/87ec633c28902596f04a98350a0653480dced432))
- refreshToken command ([73e13d6](https://github.com/kukhariev/ngx-uploadx/commit/73e13d6744e18a9c68880a82ac3e2df23d7ae361))

## [2.0.2](https://github.com/kukhariev/ngx-uploadx/compare/v2.0.1...v2.0.2) (2019-01-28)

### Features

- drop 'url' from peerDependencies ([5be4dda](https://github.com/kukhariev/ngx-uploadx/commit/5be4dda6ce4f48597e8cb383c944bc56c75dfdbe))

## [2.0.1](https://github.com/kukhariev/ngx-uploadx/compare/v2.0.0...v2.0.1) (2018-12-30)

### Features

- provide service in root ([16f06df](https://github.com/kukhariev/ngx-uploadx/commit/16f06df56cfdc72ceb4b07a5908d258c8610e020))

### BREAKING CHANGES

- requires Angular > 6

# [2.0.0](https://github.com/kukhariev/ngx-uploadx/compare/v1.2.3...v2.0.0) (2018-12-30)

### Features

- provide service in root ([d41294d](https://github.com/kukhariev/ngx-uploadx/commit/d41294d787d9142ec17d46136fecf197d74dae27))

## [1.2.3](https://github.com/kukhariev/ngx-uploadx/compare/v1.2.2...v1.2.3) (2018-11-27)

### Bug Fixes

- insecure dependency ([af01900](https://github.com/kukhariev/ngx-uploadx/commit/af01900606af42a2c09a1f9703a3f05eb1a15dad))
- upgrade dependencies ([366d45b](https://github.com/kukhariev/ngx-uploadx/commit/366d45bc8de91ed04900e168ed9d1230e107ae66))

## [1.2.2](https://github.com/kukhariev/ngx-uploadx/compare/v1.2.1...v1.2.2) (2018-10-28)

### Bug Fixes

- **build:** TS5060 ([0f988a5](https://github.com/kukhariev/ngx-uploadx/commit/0f988a5cccad0c183e81bc4c1c78d4c58ede1c91))

### Features

- add angular 7 support ([83d8068](https://github.com/kukhariev/ngx-uploadx/commit/83d806853c20c0770e35fa1c3b39e33f81d1fee9))

## [1.2.1](https://github.com/kukhariev/ngx-uploadx/compare/v1.2.0...v1.2.1) (2018-06-23)

### Bug Fixes

- add "url" to peerDependencies ([909a8a9](https://github.com/kukhariev/ngx-uploadx/commit/909a8a9f4988bc5fccb8a1b33c9b4418f0b3a265))

# [1.2.0](https://github.com/kukhariev/ngx-uploadx/compare/v1.1.3...v1.2.0) (2018-06-22)

### Features

- Location header relative path compatibility ([64f377c](https://github.com/kukhariev/ngx-uploadx/commit/64f377c1b52a6aa04aa1a8e9cb6bc3608a35c200))
- Location header relative path compatibility ([44595cf](https://github.com/kukhariev/ngx-uploadx/commit/44595cfa668697fd18abd7bd689746a89962f3ee))

## [1.1.3](https://github.com/kukhariev/ngx-uploadx/compare/v1.1.2...v1.1.3) (2018-06-18)

## [1.1.2](https://github.com/kukhariev/ngx-uploadx/compare/v1.1.1...v1.1.2) (2018-05-17)

## [1.1.1](https://github.com/kukhariev/ngx-uploadx/compare/v1.1.0...v1.1.1) (2018-05-17)

### Bug Fixes

- IE11 support ([bbba1f9](https://github.com/kukhariev/ngx-uploadx/commit/bbba1f92c7ad0501e4f526fd7367166a2e004b7a)), closes [#4](https://github.com/kukhariev/ngx-uploadx/issues/4)

# [1.1.0](https://github.com/kukhariev/ngx-uploadx/compare/v1.0.9...v1.1.0) (2018-05-12)

### Features

- use rxjs 6 and angular 6 ([73be1fa](https://github.com/kukhariev/ngx-uploadx/commit/73be1fa8e9f20c5cb5ff7f7f86463dd47e88a0f9))

### Reverts

- angular@5 compatibility ([9fada2a](https://github.com/kukhariev/ngx-uploadx/commit/9fada2a416effd889345cc6461c8b03e13665e5d))

## [1.0.9](https://github.com/kukhariev/ngx-uploadx/compare/v1.0.8...v1.0.9) (2018-04-27)

### Bug Fixes

- accessible session URI ([341a06f](https://github.com/kukhariev/ngx-uploadx/commit/341a06f0b0af8d8ba7209dd05e1cb3f6ba871d4d))
- accessible session URI ([ed1f7ec](https://github.com/kukhariev/ngx-uploadx/commit/ed1f7ec2a25c47dfea9cdf09efb626c2e70a3fa6))

## [1.0.8](https://github.com/kukhariev/ngx-uploadx/compare/v1.0.7...v1.0.8) (2018-03-24)

### Bug Fixes

- add @angular/common as a peerDependency ([1d9fdd3](https://github.com/kukhariev/ngx-uploadx/commit/1d9fdd30fe9fa90b28ab799ad004ec12f8b77a91))

## [1.0.7](https://github.com/kukhariev/ngx-uploadx/compare/v1.0.6...v1.0.7) (2018-03-23)

## [1.0.6](https://github.com/kukhariev/ngx-uploadx/compare/v1.0.5...v1.0.6) (2018-03-09)

### Features

- **ci:** autorelease ([af8a441](https://github.com/kukhariev/ngx-uploadx/commit/af8a44161d09629b7ea909c40116474007aa5442))

## [1.0.5](https://github.com/kukhariev/ngx-uploadx/compare/v1.0.4...v1.0.5) (2018-03-09)

## [1.0.4](https://github.com/kukhariev/ngx-uploadx/compare/v1.0.3...v1.0.4) (2018-02-11)

## 1.0.3 (2018-02-10)
