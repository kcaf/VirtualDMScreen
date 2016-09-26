var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    uglifycss = require('gulp-uglifycss'),
    minify = require('gulp-minify'),
    concat = require('gulp-concat'),
    stylish = require('jshint-stylish'),
    notify = require('gulp-notify'),
    inject = require('gulp-inject'),
    runSequence = require('run-sequence'),
    clean = require('gulp-clean'),
    series = require('stream-series'),
    open = require('gulp-open');

var indexTransform = function (filepath, file) {
	console.log(file.contents.toString('utf8'));
	return file.contents.toString('utf8');
};

gulp.task('default', ['clean'], function(){
	runSequence('copy', 'build', 'clean-js', 'index', 'map', 'clean-map-js', 'open');
});

gulp.task('open', function(){
	var options = {
        app: 'chrome'
    };
	gulp.src('./build/index.html')
		.pipe(open(options));
});

gulp.task('build', ['css', 'js', 'models', 'data']);

gulp.task('map', ['map-js', 'map-css', 'map-html']);

gulp.task('copy', ['copy-js', 'copy-imgs', 'copy-fonts']);

gulp.task('clean', function () {
  return gulp.src('./build/*', { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('clean-js', function () {
  return gulp.src([
  		'./build/js/*.js',
  		'!./build/js/*.min.js'
	], { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('clean-map-js', function () {
  return gulp.src([
  		'./build/js/map/*.js',
  		'!./build/js/map/*.min.js'
	], { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('map-css', function () {
	return gulp.src('./src/css/map/*.css')
		.pipe(uglifycss().on('error', function(e){
        	return 'CSS Uglify fail';
         }))
		.pipe(concat('combined.css'))
		.pipe(gulp.dest('./build/css/map'));
});

gulp.task('map-js', function () {
	return gulp.src('./src/js/map/*.js')
		.pipe(jshint())
      	.pipe(jshint.reporter(stylish)).on('error', notify.onError({ message: 'JS hint fail'}))
		.pipe(minify({
	        ext:{
	            min:'.min.js'
	        },
	        ignoreFiles: ['*.min.js']
   		}))
		.pipe(gulp.dest('./build/js/map'));
});

gulp.task('map-html', function () {
	return gulp.src('./src/map.html')
		.pipe(gulp.dest('./build'));
});

gulp.task('index', function () {
	var sources = gulp.src([
		'./build/js/jquery.min.js',
		'./build/js/jquery-ui.min.js',
		'./build/js/jquery-mwheel.min.js',
		'./build/js/jquery-scrollto.min.js',
		'./build/js/leaflet.min.js',
		'./build/js/leaflet-markerrotate.min.js',
		'./build/js/modernizr.min.js',
		'./build/js/knockout.min.js',
		'./build/js/knockout-simplegrid.min.js',
		'./build/js/*.js',
		'./build/css/*.css',
	]);
	return gulp.src('./src/index.html')
  		.pipe(inject(sources, { ignorePath: 'build', addRootSlash: false }))
  		.pipe(inject(gulp.src('./src/partials/templates/*.html'), {
			starttag: '<!-- inject:partials:templates -->',
			transform: function (filePath, file) { return file.contents.toString('utf8') }
		}))
		.pipe(inject(gulp.src('./src/partials/views/*.html'), {
			starttag: '<!-- inject:partials:views -->',
			transform: function (filePath, file) { return file.contents.toString('utf8') }
		}))
		.pipe(inject(gulp.src('./src/partials/popups/*.html'), {
			starttag: '<!-- inject:partials:popups -->',
			transform: function (filePath, file) { return file.contents.toString('utf8') }
		}))
	 	.pipe(gulp.dest('./build'));
});

/*gulp.task('copy-css', function () {
    return gulp.src('./src/css/dist/combined.css')
		.pipe(gulp.dest('./build/css'));
});*/

gulp.task('copy-js', function () {
    return gulp.src(['./src/js/dist/*.js', './src/js/*.js'])
		.pipe(gulp.dest('./build/js'));
});

gulp.task('copy-imgs', function () {
	return gulp.src('./src/css/images/*')
		.pipe(gulp.dest('./build/css/images'));
});

gulp.task('copy-fonts', function () {
	return gulp.src('./src/css/fonts/*')
		.pipe(gulp.dest('./build/css/fonts'));
});

gulp.task('css', function () {
	return gulp.src('./src/css/*.css')
		.pipe(uglifycss().on('error', function(e){
        	return 'CSS Uglify fail';
         }))
		.pipe(concat('combined.css'))
		.pipe(gulp.dest('./build/css'));
});

gulp.task('js', function () {
	/*
		return gulp.src('./src/js/*.js')
		.pipe(jshint())
      	.pipe(jshint.reporter(stylish)).on('error', notify.onError({ message: 'JS hint fail'}))
		.pipe(uglify().on('error', function(e){
        	return 'JS Uglify fail';
         }))
		.pipe(gulp.dest('./src/js/dist'));
	*/
	return gulp.src(['./build/js/*.js','!./build/js/*.min.js'])
		.pipe(jshint())
      	.pipe(jshint.reporter(stylish)).on('error', notify.onError({ message: 'JS hint fail'}))
		.pipe(minify({
	        ext:{
	            min:'.min.js'
	        },
	        ignoreFiles: ['*.min.js']
   		}))
    	.pipe(gulp.dest('./build/js'));
});

gulp.task('models', function () {
	return gulp.src('./src/js/models/*.js')
		.pipe(jshint())
      	.pipe(jshint.reporter(stylish)).on('error', notify.onError({ message: 'JS hint fail'}))
		.pipe(concat('models.js'))
		.pipe(minify({
	        ext:{
	            min:'.min.js'
	        },
	        ignoreFiles: ['.min.js']
   		}))
		.pipe(gulp.dest('./build/js'));
});

gulp.task('data', function () {
	return gulp.src('./src/data/*.js')
		.pipe(jshint({ elision: true }))
      	.pipe(jshint.reporter(stylish)).on('error', notify.onError({ message: 'Data JS hint fail'}))
		.pipe(uglify().on('error', function(e){
        	return 'Data JS Uglify fail';
         }))
		.pipe(concat('data.min.js'))
		.pipe(gulp.dest('./build/js'));
});