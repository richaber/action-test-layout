'use strict';
// Load plugins
const gulp         = require('gulp');
const concat       = require('gulp-concat');
const rename       = require('gulp-rename');
const terser       = require('gulp-terser');
const sourcemaps   = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
var sass           = require('gulp-sass')(require('node-sass'));
const stylelint    = require('@ronilaukkarinen/gulp-stylelint');
const eslint       = require('gulp-eslint');
const phpcs        = require('gulp-phpcs');
const phpcbf       = require('gulp-phpcbf');
const hash         = require('gulp-hash');
const del          = require('del');

const options = {
  hashLength: 8,
  template: '<%= name %>.<%= hash %><%= ext %>'
};

// File paths to various assets are defined here.
const PATHS = {
  php: [
    '**/*.php',
    '!blocks/**/*.*',
    '!vendor/**/*.*'
  ],
  sass: [
    'assets/scss/*.scss',
    'assets/scss/**/*.scss'
  ],
  jsVendor: [
    'node_modules/bootstrap/dist/js/bootstrap.js',
    'assets/js/vendor/*.js'
  ],
  jsTheme: [
    'assets/js/theme/*.js',
    'assets/js/theme.js'
  ]
};

// Concatenate & Minify all bower dependency javascript files
function buildScriptsVendor() {
  return (
    gulp
      .src(PATHS.jsVendor)
      .pipe(concat('vendor.js'))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(terser())
      .pipe(gulp.dest('build/js'))
  );
}

// Concatenate & Minify all theme javascript files
function buildScriptsTheme() {
  return (
    gulp
      .src(PATHS.jsTheme)
      .pipe(concat('theme.js'))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(hash(options))
      .pipe(terser())
      .pipe(gulp.dest('build/js'))
  );
}

// Concatenate all theme javascript files
function devScriptsTheme() {
  return (
    gulp
      .src(PATHS.jsTheme)
      .pipe(concat('theme.js'))
      .pipe(gulp.dest('build/js'))
  );
}

// run JS lint on theme scripts
function scriptsLint() {
  return gulp
    .src(PATHS.jsTheme)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Compile min CSS
function buildStyles() {
  return (
    gulp
      .src('assets/scss/main.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
        includePaths: PATHS.sass,
        outputStyle: 'compressed'
      }))
      .pipe(autoprefixer())
      .pipe(rename({
        basename: 'theme',
        suffix: '.min'
      }))
      .pipe(hash(options))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('build/css'))
  );
}

// Compile min Editor CSS
function buildEditorStyles() {
  return (
    gulp
      .src('assets/scss/editor.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
        includePaths: PATHS.sass,
        outputStyle: 'compressed'
      }))
      .pipe(autoprefixer())
      .pipe(rename({
        basename: 'editor',
        suffix: '.min'
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('build/css'))
  );
}

// run SCSS lint on theme styles
function stylesLint() {
  return (
    gulp
      .src(PATHS.sass)
      .pipe(stylelint({
        failAfterError: true,
        reportOutputDir: 'reports/lint',
        reporters: [
          {formatter: 'string', console: true},
          {formatter: 'json', save: 'report.json'}
        ],
        debug: true
      }))
  );
}

// run php code sniffer on theme files
function phpCodeSniffer() {
  return (
    gulp
      .src(PATHS.php)
      .pipe(phpcs({
        bin: './vendor/squizlabs/php_codesniffer/bin/phpcs',
        warningSeverity: 0
      }))
      // Log all problems that was found
      .pipe(phpcs.reporter('log'))
  );
}

// run php code sniffer on theme files
function phpCodeBeautifier() {
  return (
    gulp
      .src(PATHS.php)
      .pipe(phpcbf({
        bin: './vendor/squizlabs/php_codesniffer/bin/phpcbf',
        warningSeverity: 0
      }))
      .pipe(gulp.dest('.'))
  );
}

// remove CSS and JS files
function removeCssFiles() {
  return del(['build/css']);
}

function removeJsFiles() {
  return del(['build/js']);
}

function removeAllFiles() {
  return del(['build/css', 'build/js']);
}

// Watch files
function watchDevFiles() {
  gulp.watch(PATHS.sass, gulp.series(removeCssFiles, stylesLint, buildStyles, buildEditorStyles));
  gulp.watch(PATHS.jsTheme, gulp.series(removeJsFiles, scriptsLint, devScriptsTheme, buildScriptsVendor));
  gulp.watch(PATHS.php, phpCodeSniffer);
}

// Watch files
function watchFiles() {
  gulp.watch(PATHS.sass, gulp.series(removeCssFiles, stylesLint, buildStyles, buildEditorStyles));
  gulp.watch(PATHS.jsTheme, gulp.series(removeJsFiles, scriptsLint, buildScriptsTheme, buildScriptsVendor));
  gulp.watch(PATHS.php, phpCodeSniffer);
}

// define complex tasks
const js    = gulp.series(scriptsLint, gulp.parallel(buildScriptsTheme, buildScriptsVendor));
const build = gulp.series(removeAllFiles, scriptsLint, stylesLint, gulp.parallel(phpCodeSniffer, buildScriptsVendor, buildScriptsTheme, buildStyles, buildEditorStyles));
const dev   = gulp.series(scriptsLint, stylesLint, gulp.parallel(phpCodeSniffer, buildScriptsVendor, devScriptsTheme, buildStyles, buildEditorStyles));

// export tasks
exports.vendor         = buildScriptsVendor;
exports.theme          = buildScriptsTheme;
exports.themeDev       = devScriptsTheme;
exports.styles         = buildStyles;
exports.editor         = buildEditorStyles;
exports.scriptsLint    = scriptsLint;
exports.styleLint      = stylesLint;
exports.phpcs          = phpCodeSniffer;
exports.beautify       = phpCodeBeautifier;
exports.watchDev       = watchDevFiles;
exports.watch          = watchFiles;
exports.removeAllFiles = removeAllFiles;
exports.removeCssFiles = removeCssFiles;
exports.removeJsFiles  = removeJsFiles;
exports.js             = js;
exports.build          = build;
exports.dev            = dev;
exports.default        = build;
