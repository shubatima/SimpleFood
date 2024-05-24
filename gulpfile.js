const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

// Асинхронный импорт del для очистки папки dist
async function loadDel() {
  const delModule = await import('del');
  return delModule.default;
}

// Задача для запуска браузера с синхронизацией
function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    },
    notify: false
  });
}

// Задача для компиляции SCSS в CSS
function styles() {
  console.log('Compiling SCSS...');
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }).on('error', scss.logError)) // Обработка ошибок SCSS
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

// Задача для объединения и минификации JS файлов
function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify().on('error', function(e){
      console.log(e); // Обработка ошибок Uglify
    }))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

// Задача для оптимизации изображений
function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest('dist/images'));
}

// Задача для очистки папки dist
async function cleanDist() {
  const del = await loadDel();
  return del('dist');
}

// Задача для копирования файлов в папку dist
function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], { base: 'app' })
    .pipe(dest('dist'));
}

// Задача для слежения за изменениями файлов
function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
}

// Экспорт задач для использования в Gulp
exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);

// Задача по умолчанию
exports.default = parallel(styles, scripts, browsersync, watching);
