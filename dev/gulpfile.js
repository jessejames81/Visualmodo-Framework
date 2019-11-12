// Defining base pathes
var paths = {
    js: '../dist/js',
    css: '../dist/css',
    img: './img',
    sass: '../scss',
    node: './node'
};

// Defining requirements
var gulp = require('gulp');
var zip = require('gulp-zip');
var replace = require('gulp-replace');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var postcss = require('gulp-postcss');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var cleanCSS = require('gulp-clean-css');
var gulpSequence = require('gulp-sequence');
var autoprefixer = require('autoprefixer');


// Run:
// gulp sass
// Compiles SCSS files in CSS
gulp.task('sass', function() {
	var stream = gulp
		.src(paths.sass + '/*.scss')
		.pipe(
			plumber({
				errorHandler: function(err) {
					console.log(err);
					this.emit('end');
				}
			})
		)
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sass({ errLogToConsole: true }))
		.pipe(postcss([autoprefixer()]))
		.pipe(sourcemaps.write(undefined, { sourceRoot: null }))
		.pipe(gulp.dest(paths.css));
	return stream;
});

// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task('watch', function() {
	gulp.watch(`${paths.sass}/**/*.scss`, gulp.series('styles'));
	gulp.watch(
		[
			`${paths.dev}/js/**/*.js`,
			'js/**/*.js',
			'!js/visualmodo.js',
			'!js/visualmodo.min.js'
		],
		gulp.series('scripts')
	);
});

gulp.task('minifycss', function() {
	return gulp
		.src(`${paths.css}/visualmodo.css`)
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(cleanCSS({ compatibility: '*' }))
		.pipe(
			plumber({
				errorHandler: function(err) {
					console.log(err);
					this.emit('end');
				}
			})
		)
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.css));
});

gulp.task('cleancss', function() {
	return gulp
		.src(`${paths.css}/*.min.css`, { read: false }) // Much faster
		.pipe(ignore('visualmodo.css'))
		.pipe(rimraf());
});

gulp.task('styles', function(callback) {
	gulp.series('sass', 'minifycss')(callback);
});

// Run:
// gulp scripts.
// Uglifies and concat all JS files into one
gulp.task('scripts', function() {
	var scripts = [
		// Start Scripts        
		//`${paths.dev}/js/vslmd-functions.js`
	];
	gulp
		.src(scripts, { allowEmpty: true })
		.pipe(babel(
			{
				presets: ['@babel/preset-env']
			}
		))
		.pipe(concat('visualmodo.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.js));

	return gulp
		.src(scripts, { allowEmpty: true })
		.pipe(babel())
		.pipe(concat('visualmodo.js'))
		.pipe(gulp.dest(paths.js));
});