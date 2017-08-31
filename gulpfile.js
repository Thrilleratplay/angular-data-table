/* eslint-disable import/no-extraneous-dependencies */
require('babel-register');

const nPath = require('path');

const runSequence = require('run-sequence');
const del = require('del');


const gulp = require('gulp');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const protractorAngular = require('gulp-angular-protractor');
const postcss = require('gulp-postcss');
const rollup = require('gulp-better-rollup');
const cleanCss = require('gulp-clean-css');
const ngAnnotate = require('gulp-ng-annotate');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
// const uglify = require('gulp-uglify');
const header = require('gulp-header');
const gutils = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');

const browserSync = require('browser-sync');
const KarmaServer = require('karma').Server;
const cssnext = require('postcss-cssnext');

const path = {
  source: 'src/**/*.js',
  css: 'src/**/*.css',
  output: 'dist/',
};

const pkg = require('./package.json');

const banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

//
// Compile Tasks
// ------------------------------------------------------------
const BUILDS = {
  ES6: {
    EXTENSION: '.es6',
    FORMAT: 'es',
  },
  UMD: {
    EXTENSION: '',
    FORMAT: 'umd',
    PLUGINS: ['transform-es2015-modules-umd'],
  },
  COMMON: {
    EXTENSION: '.cjs',
    FORMAT: 'cjs',
    PLUGINS: ['transform-es2015-modules-commonjs'],
  },
};

function JsBuilder(BUILD) {
  let rolledUp = gulp.src('src/dataTable.js')
                     .pipe(sourcemaps.init())
                     .pipe(rollup({
                       external: ['angular'],
                       moduleName: 'DataTable',
                       exports: 'named',
                     },
                     BUILD.FORMAT))
                     .pipe(rename(`dataTable${BUILD.EXTENSION}.js`));

  if (BUILD.FORMAT !== 'es') {
    rolledUp = rolledUp.pipe(babel({ plugins: BUILD.PLUGINS, moduleId: 'DataTable' }))
                       .pipe(ngAnnotate({ gulpWarnings: false }));
  }

  return rolledUp.pipe(header(banner, { pkg }))
                 .pipe(sourcemaps.write(''))
                 .pipe(gulp.dest(path.output));
}

gulp.task('css', () => gulp.src(['src/themes/*.css', 'src/dataTable.css'])
    .pipe(plumber())
    .pipe(concat('dataTable.min.css'))
    .pipe(postcss([cssnext()]))
    .pipe(cleanCss())
    .pipe(gulp.dest(path.output)));
    // .pipe(browserSync.reload({ stream: true })));

gulp.task('build-es6', () => JsBuilder(BUILDS.ES6));
gulp.task('build-umd', () => JsBuilder(BUILDS.UMD));
gulp.task('build-common', () => JsBuilder(BUILDS.COMMON));

gulp.task('clean', () => del(path.output));

gulp.task('compile', ['clean'], callback => (
    runSequence(['css', 'build-es6', 'build-umd', 'build-common'], callback)
));

//
// Dev Mode Tasks
// ------------------------------------------------------------
gulp.task('serve', ['compile'], (callback) => {
  browserSync({
    open: false,
    port: 9000,
    server: {
      baseDir: ['.'],
      middleware(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      },
    },
  }, callback);
});

gulp.task('watch', ['serve'], () => {
  const watcher = gulp.watch(['src/**/*.*'], ['compile']);

  watcher.on('change', (event) => {
    gutils.log(`File ${event.path} was ${event.type}, running tasks...`);
  });
});

//
// Test Tasks
// ------------------------------------------------------------
function startKarma(callback, singleRun) {
  new KarmaServer({
    configFile: nPath.join(__dirname, 'test/karma.conf.js'),
    singleRun,
  }, (errors) => {
    if (errors === 0) {
      callback();
    } else {
      callback(new gutils.PluginError('karma', {
        message: 'Unit test(s) failed.',
      }));
    }
  }).start();
}

gulp.task('unit', (callback) => {
  startKarma(callback, true);
});

gulp.task('unit:watch', (callback) => {
  startKarma(callback, false);
});

gulp.task('e2e', ['serve'], (callback) => {
  gulp.src(['src/**/*e2e.js'])
    .pipe(protractorAngular({
      configFile: 'test/protractor.conf.js',
      debug: true,
      autoStartStopServer: true,
    }))
    .on('error', (e) => {
      callback(new gutils.PluginError('protractor', {
        message: e,
      }));
    })
    .on('end', callback);
});

gulp.task('test', ['unit', 'e2e']);
