const pug = require('gulp-pug')
const browserSync = require('browser-sync').create()
const config = require('./config')
const { selectedBrand, selectedJob } = config

module.exports = function () {
  return function pugTask () {
    return (
      require('gulp')
        .src(selectedBrand + selectedJob + config.pug.src)
        .pipe(pug())
        .on('error', function (err) {
          process.stderr.write(err.message + '\n')
          this.emit('end')
        })
        .pipe(require('gulp').dest(selectedBrand + selectedJob + config.folder.dest))
        .pipe(browserSync.stream())
    )
  }
}
