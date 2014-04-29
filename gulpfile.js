var gulp = require('gulp'),
		concat = require('gulp-concat'),
		bower = require('./bower.json'),
		ngmin = require('gulp-ngmin'),
		rename = require('gulp-rename'),
		beautify = require('gulp-beautify'),
		wrap    = require('gulp-wrapper'),
		uglify = require('gulp-uglify'),
		path = require('path'),
		tinylr = require('tiny-lr');

function server() {
	var express = require('express');
	lr = tinylr();
	var app = express();
	app
	.use(express.static(path.join(__dirname,'demo')))
	.use(tinylr.middleware({ app: app }));
	app.listen(8000);
	lr.listen(35729);
}

function reload(event) {
	var fileName = path.relative(path.join(__dirname,'demo'), event.path);
	console.log('reload: ', fileName);
	lr.changed({
		body: {
			files: [fileName]
		}
	});
}
gulp.task('default', function() {
	return gulp.src(['scr/app.js','src/*.js'])
		.pipe(concat(bower.name +'.js', {newLine: '.'}))
		.pipe(ngmin())
		.pipe(wrap({
			header : "(function (root, factory) {if (typeof define === 'function' && define.amd) {define([], factory);} else if (typeof exports === 'object') {module.exports = factory();} else {factory();}}(this, function () {	return ",
			footer : "}));"
		}))
		.pipe(beautify({indentSize: 2,preserveNewlines:true}))
		.pipe(gulp.dest('.'))
		.pipe(gulp.dest('./demo/scripts'))
		.pipe(uglify())
		.pipe(rename(bower.name +'.min.js'))
		.pipe(gulp.dest('.'));
});


gulp.task('demo',['watch'],function() {
	server();
	gulp.watch('demo/scripts/**/*.js', reload);
	gulp.watch('demo/styles/*.css', reload);
	gulp.watch('demo/views/*.html', reload);
	gulp.watch('demo/*.html', reload);
});

gulp.task('watch', function() {
	gulp.watch('src/*.js', ['default']);
});