// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const replace = require('gulp-replace');
const minifyCSS = require("gulp-minify-css");
const cleanCSS = require('gulp-clean-css');
const gulp = require('gulp'); 


// File paths
const files = { 

    jsPath: 'js/**/*.js',
    cssPath: 'css/*.css',
    sassPath: 'css/*.sass'

}

function sassTask(){    
    return src(files.sassPath)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass()) // compile SASS to CSS
        .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(dest('dist/css')
    ); // put final CSS in dist folder
}

function cssTask () { 
    return src(files.cssPath)
               .pipe(minifyCSS({compatibility: 'ie8'}))
               .pipe(gulp.dest('dist/css'));
};




// JS task: concatenates and uglifies JS files to app.min.js
function jsTask(){
    return src([
        files.jsPath
        ])
        .pipe(concat('app.min.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(dest('dist')
    ); 
}


// Cachebust
const cbString = new Date().getTime();
function cacheBustTask(){
    return src(['index.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(dest('.'));
}

// Watch task: watch SASS , CSS and JS files for changes
// If any change, run sass, css and js tasks simultaneously
function watchTask(){
    watch([ files.jsPath, files.cssPath, files.sassPath ], 
        parallel( jsTask, cssTask, sassTask));    
}

// Export the default Gulp task so it can be run
// Runs the sass ,css and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
    parallel( jsTask, cssTask , sassTask ), 
    cacheBustTask,
    watchTask
);