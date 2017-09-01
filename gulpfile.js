/* eslint-disable import/no-extraneous-dependencies */
require('babel-register');

const nPath = require('path');
const pkg = require('./package.json');

// gulp and utils
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const gutils = require('gulp-util');
const header = require('gulp-header');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');

// ES6 transpiling
const babel = require('gulp-babel');
const rollup = require('gulp-better-rollup');
const rollupHtml = require('rollup-plugin-html');
const uglify = require('gulp-uglify');

// Css
const cleanCss = require('gulp-clean-css');
const cssnext = require('postcss-cssnext');
const postcss = require('gulp-postcss');

// AngularJS
const ngAnnotate = require('gulp-ng-annotate');

// testing
const browserSync = require('browser-sync');
const KarmaServer = require('karma').Server;
const protractorAngular = require('gulp-angular-protractor');

// build paths
const path = {
  source: 'src/**/*.js',
  css: 'src/**/*.css',
  html: 'src/**/*.html',
  fonts: 'src/**/*.{ttf,woff,eof,svg}',
  output: 'dist/',
  outputFonts: 'dist/fonts',
};

// Banner
const banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  '',
].join('\n');

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
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rollup({
      external: ['angular'],
      moduleName: 'DataTable',
      exports: 'named',
      plugins: [
        rollupHtml({
          include: path.html,
          htmlMinifierOptions: {
            collapseWhitespace: true,
          },
        }),
      ],
    },
    BUILD.FORMAT))
    .pipe(rename(`dataTable${BUILD.EXTENSION}.js`));

  if (BUILD.FORMAT !== 'es') {
    rolledUp = rolledUp.pipe(babel({
      plugins: BUILD.PLUGINS,
      moduleId: 'DataTable',
    }))
      .pipe(ngAnnotate({
        gulpWarnings: false,
      }));
  }

  return rolledUp.pipe(header(banner, { pkg }))
    .pipe(gulp.dest(path.output))
    .pipe(uglify())
    .pipe(header(banner, { pkg }))
    .pipe(rename(`dataTable${BUILD.EXTENSION}.min.js`))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest(path.output));
}

gulp.task('css', () => gulp.src(['src/themes/*.css', 'src/dataTable.css'])
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(concat('dataTable.css'))
  .pipe(postcss([cssnext()]))
  .pipe(header(banner, { pkg }))
  .pipe(gulp.dest(path.output))
  .pipe(cleanCss())
  .pipe(header(banner, { pkg }))
  .pipe(rename('dataTable.min.css'))
  .pipe(sourcemaps.write(''))
  .pipe(gulp.dest(path.output)));
// .pipe(browserSync.reload({ stream: true })));

gulp.task('build-es6', () => JsBuilder(BUILDS.ES6));
gulp.task('build-umd', () => JsBuilder(BUILDS.UMD));
gulp.task('build-common', () => JsBuilder(BUILDS.COMMON));

// Copy font files
gulp.task('fonts', () => gulp.src(path.fonts).pipe(gulp.dest(path.outputFonts)));

gulp.task('clean', () => del(path.output));

gulp.task('compile', ['clean'], callback => (
  // 'build-es6', 'build-common'
  runSequence(['fonts', 'css', 'build-umd'], callback)
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
