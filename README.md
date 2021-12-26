# Subtitles Renamer

**Electron-React App For Renaming Subtitles and Movie(Series) names**

[![Standard - JavaScript Style Guide][standard-badge]][standard-url]

- [Subtitles Renamer](#subtitles-renamer)
  - [Dependencies](#dependencies)
  - [Usage](#usage)
  - [Commands](#commands)
    - [start react only](#start-react-only)
    - [development](#development)
    - [build](#build)
  - [LICENSE](#license)

Read more about Electron: https://www.electronjs.org

## Dependencies

`` Minimum requirements (versions) ``

- Node version - 14.15.0
- Electron version - 16.0.4
- React version - 17.0.2
- Parcel version - 2.0.1
- Electron-forge version - 6.0.0-beta.61

## Usage

The creation of this application is inspired by the fact that for many players the name of the video file must be the same as the name of the subtitle.
This can be especially tiring when you need to rename an entire season of a series.
The application tracks the name of video files and suggests renaming / shortening the title of both the movie and the subtitle.


To get started clone this repository and install npm dependencies:

```
$ git clone https://github.com/1978milanbabic/subtitles-renamer-app
$ cd subtitles-renamer-app && npm install
$ npm run make
```
This will create Electron App in your "./out" folder

## Commands

### start react only

`npm start`

* Starts production server.

### development

`npm run dev`

* Starts electron development & react development servers.

### build

`npm run make`

* Builds Application

## LICENSE

MIT license, Copyright (c) 2021 Milan Babic


[standard-badge]: https://cdn.rawgit.com/feross/standard/master/badge.svg "Standard - JavaScript Style Guide"
[standard-url]: https://github.com/feross/standard
