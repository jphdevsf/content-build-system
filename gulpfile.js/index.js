// ------------------------ Packages -------------------------//
const { src, dest, task, watch, series, parallel } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const pug = require('gulp-pug')
const del = require('del')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const browserSync = require('browser-sync').create()

const config = require('./lib/config')
const { selectedBrand, selectedJob } = config

const jsFILES = ['script.js']

// ------------------------ Gulp Tasks -----------------------//

// CSS (async, no done())
async function css () {
  return src(selectedBrand + selectedJob + config.scss.src)
    .pipe(
      sass({
        errorLogToConsole: true,
        outputStyle: 'compressed'
      }).on('error', sass.logError)
    )
    .pipe(dest(selectedBrand + selectedJob + config.folder.destCss))
    .pipe(browserSync.stream())
}

// HTML
async function html () {
  return src(selectedBrand + selectedJob + config.pug.src)
    .pipe(pug())
    .pipe(dest(selectedBrand + selectedJob + config.folder.dest))
    .pipe(browserSync.stream())
}

// JavaScript (Browserify + Babelify)
async function js () {
  const tasks = jsFILES.map(entry => {
    return browserify({
      entries: [selectedBrand + selectedJob + config.folder.srcJs + entry]
    })
      .transform(babelify, { presets: ['@babel/preset-env'] })
      .bundle()
      .pipe(source(entry))
      .pipe(rename({ extname: '.min.js' }))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(dest(selectedBrand + selectedJob + config.folder.destJs))
  })

  // Return a merged stream or Promise.all
  return Promise.all(tasks)
}

// Clean (del now returns a Promise)
async function cleanDist () {
  const { deleteAsync } = await import('del')
  return deleteAsync(selectedBrand + selectedJob + config.folder.dest)
}

// BrowserSync
function browserSyncT () {
  browserSync.init({
    injectChanges: true,
    server: {
      baseDir: config.mwBaseDir + config.selectedJob + config.folder.dest
    },
    directory: true
  })
}

// Reload helpers
function browserReload () {
  browserSync.reload()
}

function browserStream () {
  browserSync.stream()
}

// Watchers
function watchFiles () {
  watch(selectedBrand + selectedJob + config.scss.src, series(css))
  watch(selectedBrand + selectedJob + config.pug.src, series(html, browserReload))
  watch(selectedBrand + selectedJob + config.js.src, series(js, browserReload))
}

// Default
function defaultTask () {
  return Promise.resolve()
}

// ------------------------ Register Tasks -----------------------//
task('css', css)
task('html', html)
task('js', js)
task('clean', cleanDist)
task('watchFiles', parallel(browserSyncT, watchFiles))
task('browserReload', browserReload)
task('browserStream', browserStream)
task('default', defaultTask)
