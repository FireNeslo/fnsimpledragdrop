var gulp = require('gulp')
var concat = require('gulp-concat')
var bower = require('./bower.json')
var ngmin = require('gulp-ngmin')
var rename = require('gulp-rename')
var wrap = require('gulp-wrapper')
var path = require('path')
var tinylr = require('tiny-lr')

function server() {
	var express = require('express')
	lr = tinylr()
	var app = express()
	app
	.use(express.static(path.join(__dirname,'demo')))
	.use(tinylr.middleware({ app: app }))
	app.listen(8080)
	lr.listen(35729)
}

function reload(event) {
	var fileName = path.relative(path.join(__dirname,'demo'), event.path)
	console.log('reload: ', fileName)
	lr.changed({
		body: {
			files: [fileName]
		}
	})
}
gulp.task('default', function() {
	return gulp.src(['scr/app.js','src/*.js'])
		.pipe(concat(bower.name +'.js', {newLine: '.'}))
		.pipe(ngmin())
		.pipe(wrap({
			header : "(function (root, factory) {if (typeof define === 'function' && define.amd) {define([], factory)} else if (typeof exports === 'object') {module.exports = factory()} else {factory()}}(this, function () {	return ",
			footer : "}))"
		}))
		.pipe(gulp.dest('.'))
		.pipe(gulp.dest('./demo/scripts'))
})


gulp.task('demo', ['watch', 'default'],function() {
	server()
	gulp.watch('demo/scripts/**/*.js', reload)
	gulp.watch('demo/styles/*.css', reload)
	gulp.watch('demo/views/*.html', reload)
	gulp.watch('demo/*.html', reload)
})

gulp.task('watch', function() {
	gulp.watch('src/*.js', ['default'])
})
