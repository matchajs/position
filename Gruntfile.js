module.exports = function(grunt) {
    "use strict";

    var distPath =

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Metadata.
        meta: {
            basePath: './',
            srcPath: '<%= meta.basePath %>src/',
            deployPath: '<%= meta.basePath %>../css/'
        },

        transport: {
            options: {
                idleading: '<%= pkg.organization %>/<%= pkg.name %>/<%= pkg.version %>/',  //生成的id的格式
                alias: '<%= pkg.spm.alias %>'
            },
            build: {
                files: [{
                    cwd: 'src',
                    src: '**/*',
                    filter : 'isFile',
                    dest: '~build'
                }]
            }
        },

        concat: {
            build: {
                options: {
                    relative: true
                },
                files: [{
                    expand: true,
                    cwd: '~build/',
                    src: ['*.js'],
                    dest: 'dist/<%= pkg.version %>/',
                    ext: '.js'
                    //'dist/<%= pkg.version %>/position.js': ['~build/position.js'],
                    //'dist/<%= pkg.version %>/position-debug.js': ['~build/position-debug.js']
                }]
            }
        },

        uglify: {
            options: {
                beautify: {
                    ascii_only: true
                },
                sourceMap: 'dist/<%= pkg.version %>/<%= pkg.name %>.js.map'
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'dist/<%= pkg.version %>/',
                    src: ['*.js', '!*-debug.js'],
                    dest: 'dist/<%= pkg.version %>/'
                }]
            }
        },

        clean: {
            build: ['~build']
        }
    });

    grunt.registerTask("fix", "Fix sourceMap etc.", function() {
        var mapFile = "dist/1.0.0/position.js.map";
        var code = grunt.file.read(mapFile);
        code = code.replace('"file":"dist/1.0.0/position.js"', '"file":"position.js"');
        code = code.replace('"sources":["dist/1.0.0/position.js"]', '"sources":["position-debug.js"]');
        grunt.file.write(mapFile, code);


        var mapFile = "dist/1.0.0/position.js";
        var code = grunt.file.read(mapFile);
        code = code.replace('sourceMappingURL=dist/1.0.0/position.js.map',
            'sourceMappingURL=<%= pkg.organization %>/<%= pkg.name %>/<%= pkg.version %><%= pkg.name %>.js.map');
        grunt.file.write(mapFile, code);

        grunt.log.writeln('sourceMap is fixed.');
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('build', ['transport:build', 'concat:build', 'uglify:build', 'clean', 'fix']);
};