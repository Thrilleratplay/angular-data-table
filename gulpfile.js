/* eslint-disable import/no-extraneous-dependencies */
require('babel-register');

const nPath = require('path');

const runSequence = require('run-sequence');
const vinylPaths = require('vinyl-paths');
const del = require('del');

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const rollup = require('gulp-better-rollup');
const protractorAngular = require('gulp-angular-protractor');
const postcss = require('gulp-postcss');
const changed = require('gulp-changed');
const ngAnnotate = require('gulp-ng-annotate');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const gutils = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');

const browserSync = require('browser-sync');
const KarmaServer = require('karma').Server;
const cssnext = require('postcss-cssnext');

const path = {
  demoSource: 'demo/index.js',
  source: 'src/**/*.js',
  css: 'src/**/*.css',
  output: 'dist/',
  release: 'release/',
  outputCss: 'dist/**/*.css',
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

function builder (BUILD) {
  let rolledUp = gulp.src('src/dataTable.js')
      .pipe(sourcemaps.init())
      .pipe(rollup({
        external: ['angular'],
        moduleName: 'DataTable',
        },
        BUILD.FORMAT))
      .pipe(rename('dataTable' + BUILD.EXTENSION + '.js'));

    if (BUILD.FORMAT === 'es') {
      return rolledUp.pipe(header(banner, { pkg }))
                     .pipe(sourcemaps.write(''))
                       .pipe(gulp.dest(path.output));
    }

    return rolledUp.pipe(babel({
          plugins: BUILD.PLUGINS,
          moduleId: 'DataTable',
        }))
        .pipe(ngAnnotate({
          gulpWarnings: false,
        }))
        .pipe(header(banner, { pkg }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(path.output));
}

gulp.task('es6', () => gulp.src(path.source)
    .pipe(plumber())
    .pipe(changed(path.output, { extension: '.js' }))
    .pipe(babel())
    .pipe(ngAnnotate({
      gulpWarnings: true,
    }))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true })));

gulp.task('css', () => gulp.src(path.css)
    .pipe(plumber())
    .pipe(postcss([cssnext()]))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true })));

gulp.task('clean', () => gulp.src([path.output, path.release])
    .pipe(vinylPaths(del)));

gulp.task('compile', callback => (
    runSequence(['css', 'es6'], callback)
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
  const watcher = gulp.watch([path.source, path.css, '*.html'], ['compile']);

  watcher.on('change', (event) => {
    gutils.log(`File ${event.path} was ${event.type}, running tasks...`);
  });
});

//
// Release Tasks
// ------------------------------------------------------------

gulp.task('release', callback => (
    runSequence('clean', ['release-css', 'release-build'], 'release-umd', 'release-common', 'release-es6-min', callback)
));

gulp.task('release-css', () => gulp.src(['src/themes/*.css', 'src/dataTable.css'])
    .pipe(postcss([cssnext()]))
    .pipe(gulp.dest(path.release)));

gulp.task('release-build', () => rollup.rollup({
  entry: 'src/dataTable.js',
  external: ['angular'],
}).then(bundle => bundle.write({
  dest: 'release/dataTable.es6.js',
  format: 'es',
  moduleName: 'DataTable',
})));

const RELEASE = {
  UMD: {
    EXTENSION: '',
    PLUGINS: ['transform-es2015-modules-umd'],
  },
  COMMON: {
    EXTENSION: '.cjs',
    PLUGINS: ['transform-es2015-modules-commonjs'],
  },
  MIN: {
    EXTENSION: '.min',
    PLUGINS: ['transform-es2015-modules-umd'],
  },
};

function releaser(RELEASE_TYPE) {
  return gulp.src('release/dataTable.es6.js')
    .pipe(babel({
      plugins: RELEASE_TYPE.PLUGINS,
      moduleId: 'DataTable',
    }))
    .pipe(ngAnnotate({
      gulpWarnings: false,
    }))
    .pipe(uglify())
    .pipe(header(banner, { pkg }))
    .pipe(rename(`dataTable${RELEASE_TYPE.EXTENSION}.js`))
    .pipe(gulp.dest('release/'));
}

gulp.task('release-umd', () => releaser(RELEASE.UMD));

gulp.task('release-common', () => releaser(RELEASE.COMMON));

gulp.task('release-es6-min', () => releaser(RELEASE.MIN));

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


gulp.task('builder', () => builder(BUILDS.UMD));
