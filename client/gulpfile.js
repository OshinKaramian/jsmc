var gulp = require('gulp');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var streamify = require('gulp-streamify');
var winInstaller = require('electron-windows-installer');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var fs = require('fs');
var child = require('child_process');

var path = {
  HTML: './src/index.html',
  HTML_PLAYER: './src/video.html',
  CSS: './src/style/**/*',
  SERVER: './src/server.js',
  ELECTRON: './src/main.js',
  MINIFIED_OUT: 'build.min.js',
  MINIFIED_OUT_VIDEO: 'video.build.min.js',
  OUT: 'build.js',
  OUT_VIDEO: 'video.build.js',
  DEST: './dist',
  DEST_BUILD: './dist/build',
  DEST_SRC: './dist/src',
  DEST_CSS: './dist/style',
  ENTRY_POINT: './src/js/main/app.js',
  ENTRY_POINT_VIDEO: './src/js/video/app.js'
};

gulp.task('server', function() {
  var server = child.spawn('node', ['dist/server.js']);
  var log = fs.createWriteStream('server.log', {flags: 'a'});
  server.stdout.pipe(log);
  server.stderr.pipe(log);
});

gulp.task('copy', function(){
  return gulp.src([
    path.HTML,
    path.HTML_PLAYER,
    path.SERVER,
    path.ELECTRON   
  ])
  .pipe(gulp.dest(path.DEST));
});

gulp.task('copyJS', function(){
  return gulp.src([
    path.OUT,
    path.OUT_VIDEO
  ])
  .pipe(gulp.dest(path.DEST_SRC));
});

gulp.task('copyCSS', function(){
  return gulp.src(path.CSS)
  .pipe(gulp.dest(path.DEST_CSS));
});


gulp.task('watchMain', function() {
  gulp.watch(path.HTML, ['copy']);
  var dependencies = [
	  'react',
  	'react/addons'
  ];
  var bundler = browserify({
    entries: [path.ENTRY_POINT],
    transform: [['babelify', {presets: ['es2015', 'react']}]],
    require: dependencies,
    ignoreMissing: true,
    //detectGlobals: false,
    debug: true,
    verbose: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  });
 
  var watcher  = watchify(bundler);
  
  watcher.on('log', gutil.log);
  
  watcher.on('update', function () {
    return watcher
      .bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST_SRC))
    })
   .bundle()
   .on('error', gutil.log.bind(gutil, 'Browserify Error'))
   .pipe(source(path.OUT))
   .pipe(gulp.dest(path.DEST_SRC))
});

gulp.task('watchVideo', function() {
  gulp.watch(path.HTML_PLAYER, ['copy']);
  var dependencies = [
	  'react',
  	'react/addons'
  ];
  var bundler = browserify({
    entries: [path.ENTRY_POINT_VIDEO],
    require: dependencies,
     transform: [['babelify', {presets: ['es2015', 'react']}]],
     ignoreMissing: true,
    //detectGlobals: false,
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  });
  
  var watcher  = watchify(bundler);
  
  watcher.on('update', function () {
    return watcher
      .bundle() 
      .on('error', function(error) {
          console.log(error.stack, error.message);
          this.emit('end');
        })
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(path.OUT_VIDEO))
      .pipe(gulp.dest(path.DEST_SRC))
    })
    .bundle() 
    .on('error', function(error) {
      console.log(error.stack, error.message);
      this.emit('end');
    })
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(path.OUT_VIDEO))
    .pipe(gulp.dest(path.DEST_SRC))
});


gulp.task('build', function(){
  browserify({
    entries: [path.ENTRY_POINT],
    transform: [babelify],
    ignoreMissing: true,
    //detectGlobals: false,
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  })
  .bundle()
    .pipe(source(path.MINIFIED_OUT))
    .pipe(streamify(uglify(path.MINIFIED_OUT)))
    .pipe(gulp.dest(path.DEST_BUILD));
    
  browserify({
    entries: [path.ENTRY_POINT_VIDEO],
    transform: [babelify],
    ignoreMissing: true,
   // detectGlobals: false,
  })
  .bundle()
    .pipe(source(path.MINIFIED_OUT_VIDEO))
    .pipe(streamify(uglify(path.MINIFIED_OUT_VIDEO)))
    .pipe(gulp.dest(path.DEST_BUILD));
});

gulp.task('create-windows-installer', function(done) {
  winInstaller({
    appDirectory: './jsmc-win32-x64',
    outputDirectory: './release',
    arch: 'x64',
    iconUrl: 'http://www.iconarchive.com/download/i43635/treetog/junior/folder-public-movies.ico',
    authors: "Oshin Karamian"
  }).then(done).catch(done);
});

gulp.task('replaceHTML', function(){
  gulp.src(path.HTML)
    .pipe(htmlreplace({
      'js': 'build/' + path.MINIFIED_OUT
    }))
    .pipe(gulp.dest(path.DEST));
});

gulp.task('production', ['replaceHTML', 'build']);
gulp.task('default', ['copy', 'copyJS', 'copyCSS', 'watchMain', 'watchVideo', 'server']);
