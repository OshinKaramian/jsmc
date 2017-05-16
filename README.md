JSMC - JavaScript Media Center
==============================

A Media Center application built to be run in the browser.
[![Build Status](https://travis-ci.org/OshinKaramian/jsmc.svg?branch=master)](https://travis-ci.org/OshinKaramian/jsmc)

Installation
------------
### Dependencies
* [NodeJS](https://nodejs.org/en/)
* [Gulp](http://gulpjs.com/)
* [FFMPEG](https://www.ffmpeg.org/)

### Install a bunch of stuff
```
cd /folder/to/jsmc
cd server
npm install
cd ../client
npm install
```
### Configuration
* You will need an API Key from [TheMovieDB](https://www.themoviedb.org/documentation/api)
* Fill in your API key and the URL of the Mongo Database in

```
server/config/config.json
```

* Update the config for which folders should be scanned for media

```
server/config/files_config.json
```

Starting it up
--------------
* Index files that are in files_config.json

```
node server/scripts/index_files.js
```

* Start the server

```
cd /folder/to/jsmc/server
node server.js
```

* Start gulp
```
cd /folder/to/jsmc/client
gulp
```

* Start the server for the client
```
cd /folder/to/jsmc/client/dist
node server.js
```

* Navigate to [http://localhost:8000/index.html](http://localhost:8000/index.html)
