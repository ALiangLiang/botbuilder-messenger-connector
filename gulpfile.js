var gulp = require('gulp');

var watch = require('gulp-watch');

var source = './src/joke/locale',  
    destination = './dist/joke/locale';

gulp.task('f1', function() {  
  gulp.src(source + '/**/*', {base: source})
    .pipe(watch(source, {base: source}))
    .pipe(gulp.dest(destination));
});

var source0 = './src/adv/locale',  
    destination0 = './dist/adv/locale';

gulp.task('f2', function() {  
  gulp.src(source0 + '/**/*', {base: source0})
    .pipe(watch(source0, {base: source0}))
    .pipe(gulp.dest(destination0));
});

gulp.task('default',['f1','f2']);