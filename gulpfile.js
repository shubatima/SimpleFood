const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const cache = require('gulp-cache');

async function loadDel() {
  const delModule = await import('del');
  return delModule.default;
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    },
    notify: false
  });
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }).on('error', scss.logError))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify().on('error', function(e){
      console.log(e);
    }))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function images() {
  return src('app/images/**/*.*')
    .pipe(cache(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ])))
    .pipe(dest('dist/images'));
}

function svgSprites() {
  return src('app/images/icons/*.svg')
    .pipe(cheerio({
        run: ($) => {
            $("[fill]").removeAttr("fill");
            $("[stroke]").removeAttr("stroke");
            $("[style]").removeAttr("style");
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
        },
      },
    }))
    .pipe(dest('app/images'));
}

async function cleanDist() {
  const del = await loadDel();
  return del('dist');
}

function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], { base: 'app' })
    .pipe(dest('dist'));
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/images/icons/*.svg'], svgSprites);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.svgSprites = svgSprites;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);

exports.default = parallel(styles, scripts, browsersync, watching);
